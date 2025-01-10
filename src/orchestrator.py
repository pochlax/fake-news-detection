import os
import json
from typing import List, TypedDict
from langgraph.graph import StateGraph, END

from .report_writer_agent import ReportWriterAgent
from .content_analysis_agent import ContentAnalysisAgent
from .source_analysis_agent import SourceAnalysisAgent
from .social_media_agents import SocialMediaAgent

class AgentState(TypedDict):
    input_article: str
    input_author: str
    input_publisher: str
    input_topImage: str
    article_summary: str
    facts_dict: dict
    non_facts_dict: dict
    opinions_dict: dict
    tone: str
    tone_explanation: str
    bias: str
    bias_explanation: str
    supported_claims: str
    content_analysis: str
    # content_sentiment: dict
    content_analysis_biblio: dict
    author_trustability: str
    publisher_trustability: str
    author_publisher_explanation: str
    source_analysis_biblio: dict
    reddit_posts: List[dict]
    reddit_comments_sentiment: str
    reddit_sentiment_value: int
    reddit_sentiment_summary: str
    source_analysis: dict
    social_media_analysis: dict
    recommendation: str
    recommendation_score: int

# Define agent nodes
def run_source_analysis(state: AgentState) -> AgentState:
    """Analyze source credibility"""
    try:
        source_agent = SourceAnalysisAgent()
        result = source_agent.analyze_source(
            state["input_author"],
            state["input_publisher"],
            os.getenv("OPENAI_API_KEY"), 
            os.getenv("TAVILY_API_KEY")
        )
        formatted_json = json.loads(result["output"])
        state["author_trustability"] = formatted_json["author_trustability"]
        state["publisher_trustability"] = formatted_json["publisher_trustability"]
        state["author_publisher_explanation"] = formatted_json["findingsSummary"]
        state["source_analysis_biblio"] = formatted_json["tavily_search"]
        return state
    except Exception as e:
        raise Exception(f"Source Analysis node failed: {str(e)}") from e

def run_content_analysis(state: AgentState) -> AgentState:
    """Analyze content and generate summary"""
    try:
        content_agent = ContentAnalysisAgent()
        result = content_agent.analyze_content(
            state["input_article"],
            os.getenv("OPENAI_API_KEY"), 
            os.getenv("TAVILY_API_KEY")
        )
        formatted_json = json.loads(result["output"])
        state["article_summary"] = formatted_json["article_summary"]
        state["facts_dict"] = formatted_json["factual"]
        state["non_facts_dict"] = formatted_json["non_factual"]
        state["opinions_dict"] = formatted_json["opinionated"]
        state["tone"] = formatted_json["tone"]
        state["tone_explanation"] = formatted_json["tone_explanation"]
        state["bias"] = formatted_json["bias"]
        state["bias_explanation"] = formatted_json["bias_explanation"]
        state["supported_claims"] = formatted_json["supported_claims"]
        state["content_analysis"] = formatted_json["findingsSummary"]
        state["content_analysis_biblio"] = formatted_json["tavily_search"]
        return state
    except Exception as e:
        raise Exception(f"Content Analysis node failed: {str(e)}") from e

def categorize_value(x):
    if 67 <= x <= 100:
        return "Positive"
    elif 34 <= x <= 66:
        return "Mixed"
    elif 0 <= x <= 33:
        return "Negative"
    else:
        return "Invalid"

def run_social_media_analysis(state: AgentState) -> AgentState:
    """Analyze social media and generate summary"""
    try:
        social_media_agent = SocialMediaAgent(
            os.getenv("OPENAI_API_KEY"),
            os.getenv("REDDIT_CLIENT_ID"), 
            os.getenv("REDDIT_CLIENT_SECRET"), 
            os.getenv("REDDIT_USER_AGENT")
        )

        result = social_media_agent.analyze_social_media(
            state["input_article"]
        )

        total_sentiment = 0
        
        if result['success']:
            for post in result['posts']:
                sentiment = social_media_agent.sentiment_analyzer.analyze_sentiment(post['comments'])
                post['sentiment'] = sentiment
                total_sentiment += sentiment['average_score']
                del post['comments']

            total_sentiment = (total_sentiment + 1) / 2 
            total_sentiment = max(0, min(100, round(total_sentiment * 100)))

            state['reddit_posts'] = result['posts']
            state['reddit_comments_sentiment'] = categorize_value(total_sentiment)
            state['reddit_sentiment_value'] = total_sentiment
            state['reddit_sentiment_summary'] = social_media_agent._summarize_sentiment(result['posts'])
            return state
    except Exception as e:
        raise Exception(f"Social Media Analysis node failed: {str(e)}") from e

def run_report_writer(state: AgentState) -> AgentState:
    """Analyze results and generate report"""
    try:
        report_agent = ReportWriterAgent(os.getenv("OPENAI_API_KEY"))

        result = report_agent.write_report(
            len(state["facts_dict"]),
            len(state["non_facts_dict"]) + len(state["opinions_dict"]),
            state["tone"],
            state["tone_explanation"],
            state["bias"],
            state["bias_explanation"],
            state["supported_claims"],
            state["author_trustability"],
            state["publisher_trustability"],
            state["reddit_sentiment_summary"]
        )

        formatted_json = json.loads(result)
        state["recommendation"] = formatted_json["recommendation"]
        state["recommendation_score"] = formatted_json["recommendation_score"]

        return state
    except Exception as e:
        raise Exception(f"Report Writer node failed: {str(e)}") from e

def fake_news_analysis_workflow():
    # Initialize the graph
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("run_source", run_source_analysis)
    workflow.add_node("run_content", run_content_analysis)
    workflow.add_node("run_social", run_social_media_analysis)
    workflow.add_node("run_report", run_report_writer)

    # Define the flow
    workflow.add_edge("run_content", "run_source")
    workflow.add_edge("run_source", "run_social")
    workflow.add_edge("run_social", "run_report")
    workflow.add_edge("run_report", END)

    # Set entry point
    workflow.set_entry_point("run_content")

    # Compile
    return workflow.compile()


class NewsAnalysisOrchestrator:
    def __init__(self):
        self.workflow = fake_news_analysis_workflow()

    def analyze_article(self, article: str, author: str, publisher: str, topImage: str) -> dict:
        """Run the complete analysis workflow"""
        try:
            # Initialize state
            initial_state = {
                "input_article": article,
                "input_author": author,
                "input_publisher": publisher,
                "input_topImage": topImage,
                "article_summary": "",
                "facts_dict": {},
                "non_facts_dict": {},
                "opinions_dict": {},
                "tone": "",
                "tone_explanation": "",
                "bias": "",
                "bias_explanation": "",
                "supported_claims": "",
                "content_analysis": {},
                "content_analysis_biblio": {},
                "author_trustability": "",
                "publisher_trustability": "",
                "author_publisher_explanation": "",
                "source_analysis_biblio": {},
                "reddit_posts": [],
                "reddit_comments_sentiment": "",
                "reddit_sentiment_value": 0,
                "reddit_sentiment_summary": "",
                "source_analysis": {},
                "social_media_analysis": {},
                "recommendation": "",
                "recommendation_score": 0,
                "final_output": {}
            }

            # Run workflow
            result = self.workflow.invoke(initial_state)
            return result

        except Exception as e:
            error_msg = str(e)
            node_name = None
            
            # Extract node name from error message if present
            if "Content Analysis node failed" in error_msg:
                node_name = "Content Analysis"
            elif "Source Analysis node failed" in error_msg:
                node_name = "Source Analysis"
            elif "Social Media Analysis node failed" in error_msg:
                node_name = "Social Media Analysis"
            elif "Report Writer node failed" in error_msg:
                node_name = "Report Writer"

            return {
                "error": error_msg,
                "failed_node": node_name,
                "status": "failed"
            }