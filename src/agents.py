import random
import json
import os
import praw
import torch

from dotenv import load_dotenv
from typing import List, Dict, Optional, Type, TypedDict
from pydantic import BaseModel, Field
from transformers import pipeline
from statistics import mean

from langchain_community.llms import OpenAI
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

# from langchain.chains import SequentialChain

# class SectionContent:
#     def __init__(self, title: str, content: str):
#         self.title = title
#         self.content = content
    
report_structure_prompt = """
This report focuses on analyzing the credibility of an article.

The report will be structured as follows:

1. Introduction:
- Title: The title of the article
- Summary: A short summary of the article. Maximum of 100 words.

2. Main Body Section:
- Content Analysis: A detailed analysis of the article's content. Specifically, a detailed explanation 
of the non-factual (speculative,hypothetical, etc.) and opinions made in the article. Explain any confirmation bias
if detected.

- 

3. Conclusion:
- Recommendation: A recommendation on whether the article is credible or not.
"""

# Additional analysis that will be enhanced later.
# - Sentiment Analysis: Detects the sentiment of the article. Explains if the article is biased towards a particular side.
# - Social Media Analysis: Analyzes the sentiment of the article's topic on social media. Verifies if the article tone is 
# consistent with the sentiment of the social media.
# - Source Analysis: Checks the credibility of the source of the article.


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
"findingsSummary": " A summarry of how the non-factual and opinionated sections detected might mislead the reader. 
Pick the most important findings and limit the summary to 150 words. If there are no non-factual or opinionated sections, 
default to "No non-factual or opinionated sections detected.",
"tavily_search": ["List of sources used to confirm factual statements here..."]
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
        

social_media_analysis_prompt = """
You are an expert at searching Reddit and analyzing the sentiment of a topic from comments.

You will be provided a summary of an article as input.

Your job is to determine keywords and search terms to look up threads on Reddit that are related to the topic. Afterwards, write a summary of the sentiments.
You can use the Reddit Search Tool to extract the comments and perform sentiment analysis. The tool takes in comments as input and outputs the sentiment results

Return the response as a JSON object with the following structure:
"sentiments": ["List of sentiment results here..."],
"findingsSummary":  "A summary of the sentiment results that are more understandable to readers. Limit the analysis to 100 words", 

Note that the sentiments list should be the output returned from the Reddit Search Tool
"""

class RedditInput(BaseModel):
    query: str = Field(description="The search query for Reddit")

class CustomRedditAPITool(BaseTool):
    name: str = "reddit_search"
    description: str = "Search Reddit for information about a topic"
    args_schema: Type[BaseModel] = RedditInput
    _reddit_client: Optional[any] = None
    sentiment_analyzer: any = None

    def __init__(self, client_id: str, client_secret: str, user_agent: str):
        super().__init__()
        self._reddit_client = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )

        # Initialize sentiment analyzer
        self.sentiment_analyzer = pipeline("sentiment-analysis")

    def get_comments(self, submission) -> List[str]:
        """Extract all comments from a submission"""
        submission.comments.replace_more(limit=None)  # Get all comments
        comments = []
        for comment in submission.comments.list():
            if comment.body:  # Ensure comment has content
                comments.append(comment.body)
                if len(comments) >= 50:
                    break
        return comments

    def analyze_sentiment(self, comments: List[str]) -> Dict:
        """Analyze sentiment of comments"""
        if not comments:
            return {"positive": 0, "negative": 0, "neutral": 0, "average_score": 0}

        sentiments = []
        sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}

        for comment in comments:
            try:
                result = self.sentiment_analyzer(comment)[0]
                label = result['label']
                score = result['score']
                
                sentiment_counts[label.lower()] += 1
                sentiments.append(score if label == "POSITIVE" else -score)
            except Exception as e:
                print(f"Error analyzing comment: {e}")
                continue

        return {
            "positive": sentiment_counts["positive"],
            "negative": sentiment_counts["negative"],
            "neutral": sentiment_counts["neutral"],
            "average_score": mean(sentiments) if sentiments else 0
        }

    def _run(self, query: str) -> str:
        try: 
            # Search for top posts
            subreddit = self._reddit_client.subreddit("all")
            print("Currently looking for this query: " + query)
            top_posts = list(subreddit.search(query, sort='relevance', time_filter='all', limit=3, params={'include_over_18': 'off'}))
            
            results = []
            overall_sentiments = []
            
            for post in top_posts:
                # Get post details
                post_info = f"\nPost Title: {post.title}\nScore: {post.score}\nURL: {post.url}\n"
                results.append(post_info)
                
                # Get and analyze comments
                comments = self.get_comments(post)
                sentiment_analysis = self.analyze_sentiment(comments)
                overall_sentiments.append(sentiment_analysis)
                
                # Add sentiment analysis results
                sentiment_info = f"""
                Sentiment Analysis for {len(comments)} comments:
                - Positive comments: {sentiment_analysis['positive']}
                - Negative comments: {sentiment_analysis['negative']}
                - Neutral comments: {sentiment_analysis['neutral']}
                - Average sentiment score: {sentiment_analysis['average_score']:.2f}
                """
                results.append(sentiment_info)

            # Calculate overall sentiment
            if overall_sentiments:
                total_positive = sum(s['positive'] for s in overall_sentiments)
                total_negative = sum(s['negative'] for s in overall_sentiments)
                total_neutral = sum(s['neutral'] for s in overall_sentiments)
                avg_score = mean([s['average_score'] for s in overall_sentiments])
                
                overall_summary = f"""
                Overall Sentiment Analysis:
                Total Comments Analyzed: {total_positive + total_negative + total_neutral}
                Total Positive: {total_positive}
                Total Negative: {total_negative}
                Total Neutral: {total_neutral}
                Average Sentiment Score: {avg_score:.2f}
                """
                results.append(overall_summary)

            # return "\n".join(results)
            return results

        except Exception as e:
            return f"Error searching Reddit: {str(e)}"

class SocialMediaAgent:
    def __init__(self):
        self.social_media_sentiment = []

        
    def analyze_social_media(self, article: str, api_key: str, reddit_client_id: str, reddit_secret: str, user_agent: str) -> List[Dict]:
        # llm = OpenAI(api_key=api_key)  
        llm = ChatOpenAI(
            api_key=api_key,
            model="gpt-3.5-turbo",
            temperature=1.3
        )

        reddit_search = CustomRedditAPITool(reddit_api_id, reddit_api_secret, reddit_user_agent)
        tools = [reddit_search] 

        prompt = ChatPromptTemplate.from_messages([
            ("system", social_media_analysis_prompt),
            ("human", "Here's the article: {article}"),
            ("placeholder", "{agent_scratchpad}"),
        ])

        # Create Simple LLM chain
        # chain = LLMChain(llm=llm, prompt=prompt)
        # chain_result = chain.invoke({"article": article})


        # Create agent with tools
        agent = create_tool_calling_agent(llm, tools, prompt)
        agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
        agent_result = agent_executor.invoke({"article": article})

        formatted_json = json.dumps(agent_result, indent=2)
        print(formatted_json)
        return formatted_json


source_analysis_prompt = """
You are an expert on checking background information on authors as well as news organizations.

You will be provided the name of an author as well as the news organization that published the article.

Your job is to look for evidence that the author or news organization has published misleading or fake articles.
You can use the Tavily Search tool to confirm the factual statements (if needed). 

Return the response as a JSON object with the following structure:
"findingsSummary": "A summary of the findings made about the author and news organization. Talk about the topic that the previous misleading article was on. Limit the summary to 150 words.",
"tavily_search": ["List of sources used here..."],

If there is no evidence of publishing fake articles, the findingsSummary must default to return "The source has no previous history of publishing misinformation!"

Examples:

\'{{
  "findingsSummary": "The source has no previous history of publishing misinformation! Megan Griffith-Greene was associated with an article on Yelp, Google, and UrbanSpoon being targets for fake reviews. 
  CBC has covered topics related to disinformation and fake news, emphasizing the importance of verifying sources, particularly on social media platforms. ",
  "tavily_search": [
    "https://www.linkedin.com/in/megangriffithgreene",
    "https://www.cbc.ca/news/science/fake-news-disinformation-propaganda-internet-1.5196964"
  ]
}}\'
"""

class SourceAnalysisAgent:
    def __init__(self):
        self.findingsSummary = ""
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
    content_analysis_biblio: dict
    tone: str
    tone_explanation: str
    bias: str
    bias_explanation: str
    author_publisher_background_check: str
    source_analysis_biblio: dict
    # soc_med_reddit_comments: dict
    # social_media_biblio: dict
    # content_sentiment: dict
    # reddit_comments_sentiment: dict
    source_analysis: dict
    content_analysis: dict
    article_summary: str
    social_media_analysis: dict
    final_output: dict

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
    state["author_publisher_background_check"] = formatted_json["findingsSummary"]
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
    state["article_summary"] = formatted_json["findingsSummary"]
    state["facts_dict"] = formatted_json["factual"]
    state["non_facts_dict"] = formatted_json["non_factual"]
    state["opinions_dict"] = formatted_json["opinionated"]
    state["tone"] = formatted_json["tone"]
    state["tone_explanation"] = formatted_json["tone_explanation"]
    state["bias"] = formatted_json["bias"]
    state["bias_explanation"] = formatted_json["bias_explanation"]
    state["content_analysis_biblio"] = formatted_json["tavily_search"]
    return state

def fake_news_analysis_workflow():
    # Initialize the graph
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("run_source", run_source_analysis)
    workflow.add_node("run_content", run_content_analysis)
    # workflow.add_node("run_social", run_social_media_analysis)
    # workflow.add_node("run_combination", run_output_combination)

    # Define the flow
    workflow.add_edge("run_content", "run_source")
    # workflow.add_edge("run_content", "run_social")
    # workflow.add_edge("run_social", "run_combination")
    workflow.add_edge("run_source", END)

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
    tavily_api_key = os.getenv("TAVILY_API_KEY")


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

    # # Experimenting with Reddit API Tool
    # reddit_api_id = os.getenv("REDDIT_CLIENT_ID")
    # reddit_api_secret = os.getenv("REDDIT_CLIENT_SECRET")
    # reddit_user_agent = os.getenv("REDDIT_USER_AGENT")

    # agent = SocialMediaAgent() 
    # result = agent.analyze_social_media(random_fake_article_2, api_key, reddit_api_id, reddit_api_secret, reddit_user_agent)
    # if reddit_api_id and reddit_api_secret:
    #     reddit_tool = CustomRedditAPITool(reddit_api_id, reddit_api_secret, reddit_user_agent)
    #     testing_results = reddit_tool._run("Yoon Suk Yeol")
    #     print(testing_results)

    # query = "pesticide in tea"

    # subreddit = praw.Reddit(
    #         client_id=reddit_api_id,
    #         client_secret=reddit_api_secret,
    #         user_agent=reddit_user_agent
    #     ).subreddit("all")

    # top_posts = list(subreddit.search(
    #     query,
    #     sort='relevance',
    #     time_filter='all',
    #     limit=10,
    #     params={'include_over_18': 'off'}  # Filter NSFW content
    # ))
    # # print(top_posts)

    # for post in top_posts:
    #     # Get post details
    #     post_info = f"\nPost Title: {post.title}\nScore: {post.score}\nURL: {post.url}\n"
    #     print(post_info)

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
