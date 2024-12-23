import os
import json
from typing import Dict, List, Optional
from pydantic import BaseModel
import praw
from dotenv import load_dotenv
from langchain.tools import BaseTool
from langchain.agents import AgentType, initialize_agent
from langchain_openai import ChatOpenAI

from transformers import pipeline
from statistics import mean

class RedditPost(BaseModel):
    """Schema for Reddit post data"""
    title: str
    url: str
    score: int
    comments: List[str]

class RedditSearchTool(BaseTool):
    name:str = "reddit_search"
    description:str = "Search Reddit posts with a query and return posts with comments"
    _reddit_client: Optional[any] = None

    def __init__(self, reddit_client_id: str, reddit_client_secret: str, reddit_user_agent: str):
        super().__init__()
        # Initialize PRAW client
        self._reddit_client = praw.Reddit(
            client_id=reddit_client_id,
            client_secret=reddit_client_secret,
            user_agent=reddit_user_agent
        )

    def _run(self, query: str) -> List[Dict]:
        try:
            reddit = self._reddit_client

            posts_data = []
            # Get top 3 posts for the query
            for submission in reddit.subreddit("all").search(query, limit=3, sort="relevance"):
                submission.comments.replace_more(limit=0)
                comments = [
                    comment.body 
                    for comment in submission.comments.list()[:5] 
                    if len(comment.body.strip()) > 0
                ]
                
                post_data = {
                    "title": submission.title,
                    "url": f"https://reddit.com{submission.permalink}",
                    "score": submission.score,
                    "comments": comments
                }
                posts_data.append(post_data)

            return posts_data

        except Exception as e:
            return f"Error searching Reddit: {str(e)}"

class SentimentAnalyzer:
    sentiment_model = None

    def __init__(self):
        # Initialize sentiment analyzer
        self.sentiment_model = pipeline("sentiment-analysis")


    def analyze_sentiment(self, comments: List[str]) -> str:
        """Analyze sentiment of comments"""
        if not comments:
            return {"positive": 0, "negative": 0, "neutral": 0, "average_score": 0}

        sentiments = []
        sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}

        for comment in comments:
            try:
                result = self.sentiment_model(comment)[0]
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
    


class SocialMediaAgent:
    def __init__(self, api_key: str, reddit_api_id: str, reddit_api_secret: str, reddit_user_agent: str):
        self.llm = ChatOpenAI(temperature=0, model="gpt-4o", api_key=api_key)
        self.reddit_tool = RedditSearchTool(reddit_api_id, reddit_api_secret, reddit_user_agent)
        self.sentiment_analyzer = SentimentAnalyzer()

    def _evaluate_relevance(self, article_summary: str, posts: List[Dict]) -> List[bool]:
        """
        Evaluate if each post is relevant to the article summary
        Returns a list of booleans where each boolean represents if the corresponding post is relevant
        """
        evaluation_prompt = """
        Compare the article summary with each Reddit post and determine if they discuss the same topic.
        Return a list of "true" or "false" values, one for each post, separated by commas.
        
        Article summary: {summary}
        
        Reddit posts to evaluate:
        {posts}
        
        Return only a comma-separated list of true/false values, nothing else.
        Example: true,false,true
        """
        
        # Format posts for evaluation
        posts_text = "\n\n".join([
            f"Post {i+1}:\nTitle: {post['title']}\nURL: {post['url']}"
            for i, post in enumerate(posts)
        ])
        
        # Get relevance evaluation from LLM
        response = self.llm.predict(
            evaluation_prompt.format(summary=article_summary, posts=posts_text)
        ).lower()
        
        # Convert response to list of booleans
        try:
            # Split response and convert to booleans
            relevance = [value.strip() == "true" for value in response.split(",")]
            
            # Ensure we have a boolean for each post
            if len(relevance) != len(posts):
                # If lengths don't match, return all False
                return [False] * len(posts)
                
            return relevance
        except Exception as e:
            # In case of parsing error, return all False
            return [False] * len(posts)

    def _generate_search_query(self, article_summary: str, attempt: int) -> str:
        """Generate a search query based on the article summary and previous attempts"""
        query_prompt = f"""
        Generate a search query to find Reddit threads about the article topic.
        Make each attempt different from previous ones. Cannot use the same words.
        Keep the query concise (1-3 words). 
        The query should not use the word "Reddit" or "Toxic Tea Brands"
        
        Article summary: {article_summary}
        Attempt number: {attempt}
        
        Return only the search query, nothing else.
        """
        
        return self.llm.predict(query_prompt)

    def analyze_social_media(self, article_summary: str) -> Dict:
        try:
            max_attempts = 3
            posts_with_comments = []
            for attempt in range(1, max_attempts + 1):
                # Generate search query
                query = self._generate_search_query(article_summary, attempt)
                
                # Search Reddit
                posts = self.reddit_tool._run(query)
                
                # Check if posts are lists (not error messages)
                if not isinstance(posts, list):
                    continue
            
                # Evaluate relevance for each post
                relevance = self._evaluate_relevance(article_summary, posts)
                
                # Filter relevant posts
                relevant_posts = [
                    post for post, is_relevant in zip(posts, relevance) 
                    if is_relevant
                ]

                posts_with_comments.extend(relevant_posts)

                if len(posts_with_comments) >= 2:
                    # result = {
                    #     "success": True,
                    #     "queries_used": [
                    #         self._generate_search_query(article_summary, i) 
                    #         for i in range(1, attempt + 1)
                    #     ],
                    #     "attempt_number": attempt,
                    #     "posts": posts_with_comments
                    # }
                    return {
                        "success": True,
                        "queries_used": [
                            self._generate_search_query(article_summary, i) 
                            for i in range(1, attempt + 1)
                        ],
                        "attempt_number": attempt,
                        "posts": posts_with_comments
                    }
                
                # If we're at the last attempt and still haven't found relevant posts
                if attempt == max_attempts:
                    return {
                        "success": False,
                        "error": "No relevant posts found after maximum attempts",
                        "queries_tried": [
                            self._generate_search_query(article_summary, i) 
                            for i in range(1, max_attempts + 1)
                        ],
                        "posts": []
                    }

            # for post in posts_with_comments:
            #     sentiment = self.sentiment_analyzer.analyze_sentiment(post.comments)
            #     post["sentiment"] = sentiment

            # return result

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "posts": []
            }



if __name__ == "__main__":
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

    load_dotenv()

    api_key = os.getenv("OPENAI_API_KEY")
    reddit_api_id = os.getenv("REDDIT_CLIENT_ID")
    reddit_api_secret = os.getenv("REDDIT_CLIENT_SECRET")
    reddit_user_agent = os.getenv("REDDIT_USER_AGENT")

    agent = SocialMediaAgent(api_key, reddit_api_id, reddit_api_secret, reddit_user_agent)
    result = agent.analyze_social_media(test_article)
    print(json.dumps(result, indent=2))
    if result['success']:
        for post in result['posts']:
            sentiment = agent.sentiment_analyzer.analyze_sentiment(post['comments'])
            post['sentiment'] = sentiment
            
    print(json.dumps(result, indent=2))



    # print(reddit_api_id, reddit_api_secret, reddit_user_agent)

