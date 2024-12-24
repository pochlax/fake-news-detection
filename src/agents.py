import random
import json
import os
import praw
import torch

from dotenv import load_dotenv
from typing import List, Dict, Optional, Type, TypedDict, Union
from pydantic import BaseModel, Field
from transformers import pipeline
from statistics import mean

# from langchain_community.llms import OpenAI
from openai import OpenAI
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.agents import AgentExecutor, create_tool_calling_agent

from langchain_community.tools.reddit_search.tool import RedditSearchRun
from langchain_community.utilities.reddit_search import RedditSearchAPIWrapper
from langchain.tools import BaseTool
from langchain_community.tools.reddit_search.tool import RedditSearchSchema

from langgraph.graph import StateGraph, END
# from social_media_agents import SocialMediaAgent # Use when testing from agents.py
from .social_media_agents import SocialMediaAgent # Use when testing from main.py
    
report_writer_prompt = """
Write a report summarizing the findings ofthe credibility of an article.

Using the provided information, create a credibility assessment report.

Input Information:
- Number of Facts: {factual_length}
- Number of Non-facts and Opinions: {non_factual_and_opinion_length}
- Tone: {tone}
- Tone Explanation: {tone_explanation}
- Bias: {bias}
- Bias Explanation: {bias_explanation}
- Supported Claims: {supported_claims}
- Author Trustability: {author_trustability}
- Publisher Trustability: {publisher_trustability}
- Reddit Sentiment Summary: {reddit_sentiment_summary}

Return ONLY a JSON object with exactly two fields:
1. "recommendation": A detailed explanation of the article's credibility based on content analysis, source analysis, and social media sentiment
2. "recommendation_score": A number between 0-100 representing overall credibility

Example output:
\'{{
    "recommendation": "Based on analysis, this article shows strong credibility with factual content and balanced reporting, though source reliability raises some concerns...",
    "recommendation_score": 75
}}\'
"""

# The report will be structured as follows:

# 1. Introduction:
# - Title: The title of the article
# - Summary: A short summary of the article. Maximum of 100 words.

# 2. Main Body Section:
# - Content Analysis: A detailed analysis of the article's content. Specifically, a detailed explanation 
# of the non-factual (speculative,hypothetical, etc.) and opinions made in the article. Explain how the tone and bias 
# of the article supports or misleads the reader.

# - Source Analysis: A detailed analysis of the author's background and credibility of the source organization.

# - Social Media Analysis: A detailed analysis of the sentiment of the article's topic on social media. Verifies if the article tone is 
# consistent with the sentiment on social media.

# 3. Conclusion:
# - Recommendation: A recommendation on whether the article is credible or not. Use the findings from the content analysis (tone, bias, ratio of 
# factual to non-factual and opinionated claims), source analysis(author and publisher trustability), and social media sentiment to make the recommendation.

class ReportWriterAgent:
    def __init__(self, api_key: str):
        self.llm = ChatOpenAI(temperature=0, model="gpt-4o", api_key=api_key)
    
    def write_report(self, factual_length: int, 
        non_factual_and_opinion_length: int, 
        tone: str, 
        tone_explanation: str, 
        bias: str, 
        bias_explanation: str, 
        supported_claims: str, 
        author_trustability: str, 
        publisher_trustability: str,
        reddit_sentiment_summary: str
    ) -> str:
        
        response = self.llm.predict(
            report_writer_prompt.format(
                factual_length=factual_length, 
                non_factual_and_opinion_length=non_factual_and_opinion_length, 
                tone=tone, 
                tone_explanation=tone_explanation, 
                bias=bias, 
                bias_explanation=bias_explanation, 
                supported_claims=supported_claims, 
                author_trustability=author_trustability, 
                publisher_trustability=publisher_trustability, 
                reddit_sentiment_summary=reddit_sentiment_summary
            )
        )

         # Extract JSON string from the response by removing ```json and ``` markers
        json_str = response.replace('```json', '').replace('```', '').strip()

        return json_str


content_analysis_prompt = """
You are an expert at analyzing articles.

You will be provided with an article as input.

Your goal is to extract factual, non-factual (speculative,hypothetical, etc.) and opinionated sections of the article. 
You can use the Tavily Search tool to confirm the factual statements (if needed). 

Return the response as a JSON object with the following structure:  
"factual": ["List of factual statements here..."],
"non_factual": ["List of non-factual statements here..."],
"opinionated": ["List of opinionated statements here..."],
"tone": "The tone of the article. The only return should be one of the following: Satirical, Sensational, Persuasive, Optimistic, Critical, Informative.",
"tone_explanation": "A short explanation of why the tone is the one that it is.",
"bias": "The bias of the article. The only return should be one of the following: None, Minimal, Moderate, Strong",
"bias_explanation": "A short explanation of why the bias is the one that it is.",
"supported_claims": "The claims made in the article. The only return should be one of the following: Well-Supported, Reasonably-Supported, Speculative/ Anecdotal, Misleading". If at least 85 percent of the 
statements are factual, return "Well Supported". If between 65-85 percent of the statements are factual, return "Reasonably Supported". If atleast 60 percent of the statements are either factual 
or opinionated, return "Speculative/ Anecdotal". Else, return "Misleading".
"findingsSummary": " A summarry of how the non-factual and opinionated sections detected might mislead the reader. 
Pick the most important findings and limit the summary to 150 words. If there are no non-factual or opinionated sections, 
default to "No non-factual or opinionated sections detected.",
"tavily_search": ["List of sources used to confirm factual statements here..."],
"article_summary": A summary of the article. Limit the summary to 150 words.
"""

# # Old version of prompt 
# content_analysis_prompt = """
# You are an expert at analyzing articles.

# You will be provided with an article as input.

# Your goal is to extract factual, non-factual (speculative,hypothetical, etc.) and opinionated sections of the article. 
# You can use the Tavily Search tool to confirm the factual statements (if needed). 

# You will need to return following sections:
# - factual: A list of factual statements.
# - non_factual: A list of non-factual statements.
# - opinionated: A list of opinionated statements.
# - findingsSummary: A summarry of how the non-factual and opinionated sections detected might mislead the reader. 
# Pick the most important findings and limit the summary to 150 words. If there are no non-factual or opinionated sections, 
# default to "No non-factual or opinionated sections detected."
# - tavily_search: A list of sources that were used to confirm the factual statements.
# """

class ContentAnalysisAgent:
    def __init__(self):
        self.factual = []
        self.non_factual = []
        self.opinions = []
        self.tone = ""
        self.tone_explanation = ""
        self.bias = ""
        self.bias_explanation = ""
        self.supported_claims = ""
        self.findingsSummary = ""
        self.tavily_search = []
    

    def analyze_content(self, article: str, api_key: str, tavily_api_key: str) -> List[Dict]:
        """
        Analyzes the text content and returns a list of dictionaries with the analysis.

        Args:
            article (str): The text content to analyze.

        Returns:
            List[Dict]: A list of dictionaries with the findings.
        """

        # Initialize LLM
        llm = ChatOpenAI(
            api_key=api_key,
            model="gpt-3.5-turbo",
            temperature=0.3
        )

        # Initialize Tools
        search = TavilySearchResults(max_results=1)
        tools = [search] 

        # Initialize Prompt Template
        prompt = ChatPromptTemplate.from_messages([
            ("system", content_analysis_prompt),
            ("human", "Here's the article: {article}"),
            ("placeholder", "{agent_scratchpad}"),
        ])

        # Create AI Agent with Tools
        agent = create_tool_calling_agent(llm, tools, prompt)
        agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
        agent_result = agent_executor.invoke({"article": article})

        return agent_result

source_analysis_prompt = """
You are an expert on checking background information on authors as well as news organizations.

You will be provided the name of an author as well as the news organization that published the article.

Your job is to look for evidence that the author or news organization has published misleading or fake articles.
You can use the Tavily Search tool to confirm the factual statements (if needed). 

Return the response as a JSON object with the following structure:
"author_trustability": "The trustability of the author. The only return should be one of the following: Untrustable, Questionable, Somewhat-Reliable, Trusted.",
"publisher_trustability": "The trustability of the publisher. The only return should be one of the following: Untrustable, Questionable, Somewhat-Reliable, Trusted.",
If the author or publisher has no history of misinformation, return "Somewhat-Reliable". If they have at most one case of misinformation, return "Questionable". If they have more than one, return "Untrustable". 
If the author or publisher has a long history of publishing articles without any history of misinformation, return "Trustable".
"findingsSummary": "A summary of the findings made about the author and news organization. Talk about the topic that the previous misleading article was on. Limit the summary to 150 words.",
"tavily_search": ["List of sources used here..."],

If there is no evidence of publishing fake articles, the findingsSummary must default to return "The source has no previous history of publishing misinformation!"

Examples:

\'{{
  "author_trustability": "Somewhat-Reliable",
  "publisher_trustability": "Trusted",
  "findingsSummary": "The source has no previous history of publishing misinformation! Megan Griffith-Greene is known for her role as the service journalism editor at The Washington Post and the Philadelphia Inquirer. 
  CBC/Radio-Canada is a public broadcaster known for its value, impact, and behind-the-scenes stories.",
  "tavily_search": [
    "https://www.linkedin.com/in/megangriffithgreene",
    "https://www.cbc.ca/news/science/fake-news-disinformation-propaganda-internet-1.5196964"
  ]
}}\'
"""

class SourceAnalysisAgent:
    def __init__(self):
        self.findingsSummary = ""
        self.author_trustability = ""
        self.publisher_trustability = ""
        self.tavily_search = []
    

    def analyze_source(self, author: str, publisher: str, api_key: str, tavily_api_key: str) -> List[Dict]:
        # llm = OpenAI(api_key=api_key)  
        llm = ChatOpenAI(
            api_key=api_key,
            model="gpt-3.5-turbo",
            temperature=1
        )

        search = TavilySearchResults(max_results=1)
        tools = [search] 

        prompt = ChatPromptTemplate.from_messages([
            ("system", source_analysis_prompt),
            ("human", "Here's the author's name: {author} and the publishing company: {publisher}"),
            ("placeholder", "{agent_scratchpad}"),
        ])

        # Create agent with tools
        agent = create_tool_calling_agent(llm, tools, prompt)
        agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
        agent_result = agent_executor.invoke({"author": author, "publisher": publisher})

        # (agent_result)
        # formatted_json = json.loads(agent_result)
        # formatted_json = json.dumps(agent_result, indent=2)
        # print(formatted_json)
        return agent_result


class AgentState(TypedDict):
    input_article: str
    input_author: str
    input_publisher: str
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
    content_analysis: dict
    article_summary: str
    social_media_analysis: dict
    recommendation: str
    recommendation_score: int
# Define agent nodes
def run_source_analysis(state: AgentState) -> AgentState:
    """Analyze source credibility"""
    source_agent = SourceAnalysisAgent()
    result = source_agent.analyze_source(
        state["input_author"],
        state["input_publisher"],
        os.getenv("OPENAI_API_KEY"), 
        os.getenv("TAVILY_API_KEY")
    )
    # state["source_analysis"] = result
    formatted_json = json.loads(result["output"])
    state["author_trustability"] = formatted_json["author_trustability"]
    state["publisher_trustability"] = formatted_json["publisher_trustability"]
    state["author_publisher_explanation"] = formatted_json["findingsSummary"]
    state["source_analysis_biblio"] = formatted_json["tavily_search"]
    return state

def run_content_analysis(state: AgentState) -> AgentState:
    """Analyze content and generate summary"""
    content_agent = ContentAnalysisAgent()
    result = content_agent.analyze_content(
        state["input_article"],
        os.getenv("OPENAI_API_KEY"), 
        os.getenv("TAVILY_API_KEY")
    )
    # state["content_analysis"] = result
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

    total_sentiment = max(0, min(100, round(total_sentiment * 100)))

    state['reddit_posts'] = result['posts']
    state['reddit_comments_sentiment'] = categorize_value(total_sentiment)
    state['reddit_sentiment_value'] = total_sentiment
    state['reddit_sentiment_summary'] = social_media_agent._summarize_sentiment(result['posts'])
    return state

def run_report_writer(state: AgentState) -> AgentState:
    """Analyze results and generate report"""
    report_agent = ReportWriterAgent(os.getenv("OPENAI_API_KEY"))
    # result = content_agent.analyze_content(
    #     state["input_article"],
    #     os.getenv("OPENAI_API_KEY"), 
    #     os.getenv("TAVILY_API_KEY")
    # )

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

    # print(result)

    formatted_json = json.loads(result)
    state["recommendation"] = formatted_json["recommendation"]
    state["recommendation_score"] = formatted_json["recommendation_score"]

    return state

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
    # workflow.add_edge("run_social", END)
    workflow.add_edge("run_social", "run_report")
    workflow.add_edge("run_report", END)

    # Set entry point
    workflow.set_entry_point("run_content")

    # Compile
    return workflow.compile()


# Usage class
class NewsAnalysisOrchestrator:
    def __init__(self):
        self.workflow = fake_news_analysis_workflow()

    def analyze_article(self, article: str, author: str, publisher: str) -> dict:
        """Run the complete analysis workflow"""
        try:
            # Initialize state
            initial_state = {
                "input_article": article,
                "input_author": author,
                "input_publisher": publisher,
                "source_analysis": {},
                "content_analysis": {},
                "article_summary": "",
                "social_media_analysis": {},
                "final_output": {}
            }

            # Run workflow
            result = self.workflow.invoke(initial_state)

            return result

        except Exception as e:
            return {
                "error": str(e),
                "status": "failed"
            }



if __name__ == "__main__":
    from pathlib import Path

    test_article = """
    Many Popular Tea Bags Contain Alarming Amounts of Deadly Pesticides (avoid these brands like the plague) Most conventional tea brands such as Lipton, Allegro, Celestial Seasonings, Tazo, Teavana, Bigelow, Republic of Tea, Twinings, Yogi, Tea Forte, Mighty Leaf, Trader Joe’s, Tetley contain really high levels of toxic substances such as fluoride and pesticides. We are not talking about calcium fluoride which is a natural element, but about the synthetic fluoride which is a toxic by product. These levels are dangerously high to the point of being considered unsafe. So drinking cheap tea can be as bad as eating junk food. Cheap Tea Contains Fluoride and Pesticides 
    Most teas are not washed before being dried, thus non-organic teas contain pesticide residues. Some tea brands ( even those claimed organic or pesticide free! ) have recently been found to contain pesticides that are known carcinogens – in quantities above the US and EU limits! 
    A new study published in the journal of, Food Research International , found that cheaper blends contain enough fluoride to put people under the risk of many illnesses such as bone tooth, kidney problems and even cancer. 
    In fact, some brands of cheap tea contain nearly 7 parts per million (ppm) and the allowed level of fluoride is 4 ppm. This is quite scary since fluoride gets into your bones and accumulates in your body. It stays there for years. So how did fluoride get into tea? 
    The tea plant accumulates fluoride as it grows. This means that old leaves contain the most fluoride. Cheaper quality teas are often made from old leaves that contain more fluoride than young tea leaves (here is an example) . Additionally, these cheaper brands use smaller leaves which contain more fluoride. 
    And what about decaffeinated tea? 
    Well, decaffeinated tea showed higher fluoride levels than caffeinated tea. 
    So what is the solution? Should you stop drinking tea all together? Of course not! First of all, make sure to buy loose leaf tea and brew your tea from scratch. Bagged tea which might seem convenient and ready to go, is often made from low quality leaves which surely contain more fluoride. Stick to white tea (here) . It has the least amount of fluoride. Buy organic tea because the methods for cultivation are more sophisticated and conscious. They might even use purified water for the soil. We’ve just scratched the surface here, please check out Food Babe’s full report for more detailed information and a chart of which teas came out with their reputations intact – and please share with your tea-loving friends!
    """

    # print(f"PyTorch version: {torch.__version__}")

    # test_file = Path("test_text.txt")
    # test_file.write_text(test_text)

     ##  ------------------------ SANDBOX TESTING ------------------------

    # Load environment variables from .env
    load_dotenv()

    # Access environment variables
    api_key = os.getenv("OPENAI_API_KEY")
    # os.putenv("TAVILY_API_KEY", "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")
    tavily_api_key = os.getenv("TAVILY_API_KEY")

    # os.setenv("TAVILY_API_KEY") = "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"


     ##  ------------------------ CONTENT ANALYSIS AREA ------------------------

    # if api_key and tavily_api_key:
    # agent = ContentAnalysisAgent()
    # result = json.loads(agent.analyze_content(test_article, api_key, tavily_api_key)['output'])
    # else:
        # print("Skipping OpenAI test - no API key found in environment variables")

    ##  ------------------------ SOURCE ANALYSIS AREA ------------------------

    # agent = SourceAnalysisAgent() 
    # result = agent.analyze_source("Jonathan Moylan", "BBC", api_key, tavily_api_key)['output']

     ##  ------------------------ SOSMED ANALYSIS AREA ------------------------

    # Experimenting with Reddit API Tool
    reddit_api_id = os.getenv("REDDIT_CLIENT_ID")
    reddit_api_secret = os.getenv("REDDIT_CLIENT_SECRET")
    reddit_user_agent = os.getenv("REDDIT_USER_AGENT")

    ##  ------------------------ LANGRAPH AREA ------------------------
    # Create orchestrator
    orchestrator = NewsAnalysisOrchestrator()

    # Test article
    test_article = {
        "text": test_article,
        "author": "Jonathan Moylan",
        "publisher": "New York Times"
    }

    # Run analysis
    result = orchestrator.analyze_article(
        test_article["text"],
        test_article["author"],
        test_article["publisher"]
    )

    # Print or save results
    print(json.dumps(result, indent=2))

    # # Clean up test file
    # test_file.unlink()
