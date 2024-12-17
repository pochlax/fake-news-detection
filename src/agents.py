import random
import json
import os
import praw
import torch

from dotenv import load_dotenv
from typing import List, Dict, Optional, Type
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

        # llm = OpenAI(api_key=api_key)  
        llm = ChatOpenAI(
            api_key=api_key,
            model="gpt-3.5-turbo",
            temperature=0
        )

        search = TavilySearchResults(max_results=1)
        tools = [search] 

        # prompt = ChatPromptTemplate.from_template([
        #     SystemMessage(content=content_analysis_prompt),
        #     HumanMessage(content="{article}")
        # ])

        prompt = ChatPromptTemplate.from_messages([
            ("system", content_analysis_prompt),
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

        # print(agent_result)

        # print(agent_result['output'])

        # return agent_result['output']

        formatted_json = json.dumps(agent_result, indent=2)
        # print(formatted_json)
        return formatted_json


# class CustomRedditAPITool(BaseTool):
#     name: str = "reddit_search" 
#     description: str = "Search Reddit for information about a topic" 
#     redditSearch: Optional[any] = None

#     def __init__(self, reddit_client_id: str, reddit_client_secret: str, reddit_user_agent: str):
#         # Setup Reddit tool
#         reddit = RedditSearchAPIWrapper(
#             client_id = reddit_client_id,
#             client_secret = reddit_client_secret,
#             user_agent = reddit_user_agent
#         )

#         reddit_tool = RedditSearchRun(api_wrapper=reddit)
#         self.redditSearch = reddit_tool

#     def _run(self, query: str) -> str:
#         search_params = RedditSearchSchema(
#             query=query, time_filter="week", limit="2"
#         )
#         results = self.redditSearch.run(tool_input=search_params.dict())
#         print(result)


social_media_analysis_prompt = """
You are an expert at searching Reddit and analyzing the sentiment of a topic from comments.

You will be provided a summary of an article as input.

Your job is to determine keywords and search terms to look up threads on Reddit that are related to the topic. Afterwards, write a summary of the sentiments.
You can use the Reddit Search Tool to extract the comments and perform sentiment analysis. The tool takes in comments as input and outputs the sentiment results

Return the response as a JSON object with the following structure:
"sentiments": ["Array of sentiment results here..."],
"findingsSummary":  "A summary of the sentiment results that are more understandable to readers. Limit the analysis to 100 words", 
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

            return "\n".join(results)

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


class QuizAgent:
    def __init__(self):
        self.questions = []

    def generate_questions(self, text_path: str, num_questions: int = 4) -> List[Dict]:
        """
        Generates multiple choice questions from a text file.

        Args:
            text_path (str): Path to the text file
            num_questions (int): Number of questions to generate (default: 4)

        Returns:
            List[Dict]: List of dictionaries containing questions, options, and correct answers
        """
        # Read the text file
        with open(text_path, "r", encoding="utf-8") as file:
            text = file.read()

        # Generate questions (this is a simple implementation - you might want to use
        # more sophisticated NLP techniques in a production environment)
        sentences = [s.strip() for s in text.split(".") if s.strip()]

        quiz_questions = []
        for _ in range(min(num_questions, len(sentences))):
            # Select a random sentence for the question
            sentence = random.choice(sentences)
            sentences.remove(sentence)  # Avoid duplicate questions

            # Create a question by removing a key word
            words = sentence.split()
            target_word = random.choice([w for w in words if len(w) > 3])
            question = sentence.replace(target_word, "_____")

            # Generate incorrect options
            all_words = [w for w in text.split() if len(w) > 3]
            wrong_options = random.sample([w for w in all_words if w != target_word], 3)

            # Create options and shuffle them
            options = wrong_options + [target_word]
            random.shuffle(options)

            # Create question dictionary
            quiz_question = {
                "question": question,
                "options": options,
                "correct_answer": target_word,
            }

            quiz_questions.append(quiz_question)
        # Format the questions as a string
        return self.format_quiz(quiz_questions)

    def format_quiz(self, questions: List[Dict]) -> str:
        """
        Formats the quiz questions into a readable string.
        """
        formatted_quiz = ""
        for i, q in enumerate(questions):
            formatted_quiz += f"Question {i}: {q['question']}\n"
            for j, option in enumerate(q["options"]):
                formatted_quiz += f"{chr(97 + j)}) {option}\n"
            formatted_quiz += f"\nCorrect answer: {q['correct_answer']}\n\n"
        return formatted_quiz

    def generate_questions_with_openai(
        self, text_path: str, num_questions: int = 4, api_key: Optional[str] = None
    ) -> List[Dict]:
        import openai

        """
        Generates multiple choice questions using OpenAI's API.

        Args:
            text_path (str): Path to the text file
            num_questions (int): Number of questions to generate (default: 4)
            api_key (Optional[str]): OpenAI API key. If None, uses environment variable.

        Returns:
            List[Dict]: List of dictionaries containing questions, options, and correct answers
        """
        # Set up OpenAI client
        if api_key:
            openai.api_key = api_key

        # Read the text file
        with open(text_path, "r", encoding="utf-8") as file:
            text = file.read()

        # Create the prompt for OpenAI
        prompt = f"""
        Create {num_questions} multiple choice questions based on this text:
        {text}

        Format each question as a JSON object with these fields:
        - question: the question text
        - options: array of 4 possible answers
        - correct_answer: the correct answer (must be one of the options)

        Return only a JSON array of these question objects.
        """

        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that creates quiz questions.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
            )

            # Parse the response
            import json

            questions = json.loads(response.choices[0].message.content)

            return questions

        except Exception as e:
            print(f"Error generating questions with OpenAI: {e}")
            return []


if __name__ == "__main__":
    from pathlib import Path

    # Test file path - create a sample text file
    test_text = """
    The Python programming language was created by Guido van Rossum.
    Python is known for its simple and readable syntax.
    The language was named after Monty Python's Flying Circus.
    Python supports multiple programming paradigms including procedural, object-oriented, and functional programming.
    """


    random_fake_article = """
    Solar Panels In The UK Surpass Coal-Powered Electricity Nov 16, 2016 1 0 
    According to research from Carbon Brief , electricity coming from solar panels in the UK surpassed the amount that came from coal-power. The solar panels across the UK generated about 7,000 gigawatt hours of electricity between April and September, while coal produced about 6,300 gigawatt hours. Solar power continues to trend positively. 
    According to James Court, who is the head of the Renewable Energy Association , this is an incredible accomplishment: 
    “Solar overtaking coal this summer would have been largely unthinkable five years ago.” 
    However, now that winter is approaching, coal will take over again in production as there is a greater need for more heating and lighting through the cold months. 
    Juliet Davenport, who is the CEO of Good Energy , recently said : 
    “When I started my company 15 years ago, you could fit the whole UK renewable energy industry into a small room, and now nearly 25% of the UK’s power comes from renewables. As clean technology advances, Britain is bidding fair-well to coal. The transition to a 100% renewable future is within Britain’s grasp.” 
    This is a great step forward and another sign of the times we are living in. It is becoming cheaper to use solar every year that passes. In fact, according to the Renewable Energy Institute , the cost of solar energy will be cheaper than fossil fuel energy by 2025, with it decreasing every year until that point. “The answer rises every morning.” 
    In another sign of the continuing trend towards clean and renewable energy, it has been reported by the U.S. Energy Information Administration that U.S. oil companies last year lost $67 billion, at a time when oil prices took a major dive. On the opposite end of that spectrum, Elon Musk’s Tesla company made $22 million in the first quarter of this year . Again, we see the trend moving towards clean energy. 
    Throughout the eastern hemisphere of the world, there is another large sign that renewable energy is here to stay and is advancing quickly. 
    In September of this year, leaders from China, Russia, Japan and South Korea met to sign an agreement to begin building what is known as the Asian Super-Grid . The grid is set to become the world’s largest collaboration of sustainable, renewable and clean energy, which will provide energy to the four countries involved, as well as throughout Southern Africa, Europe and Southeast Asia. 
    How soon do you think the world will be running off of entirely renewable energy? What will be the obstacles? What are the current obstacles? What other renewables exist outside of solar, wind, wave and geothermal that excite you? What other stories are out there that are yet more proof that the world is moving in a positive direction with it’s energy usage? 
    Lance Schuttler graduated from the University of Iowa with a degree in Health Science and does health coaching through his website Orgonlight Health . You can follow the Orgonlight Health facebook page or visit the website for more information and other inspiring articles.
    """

    random_fake_article_2 = """
    Many Popular Tea Bags Contain Alarming Amounts of Deadly Pesticides (avoid these brands like the plague) Most conventional tea brands such as Lipton, Allegro, Celestial Seasonings, Tazo, Teavana, Bigelow, Republic of Tea, Twinings, Yogi, Tea Forte, Mighty Leaf, Trader Joe’s, Tetley contain really high levels of toxic substances such as fluoride and pesticides. We are not talking about calcium fluoride which is a natural element, but about the synthetic fluoride which is a toxic by product. These levels are dangerously high to the point of being considered unsafe. So drinking cheap tea can be as bad as eating junk food. Cheap Tea Contains Fluoride and Pesticides 
    Most teas are not washed before being dried, thus non-organic teas contain pesticide residues. Some tea brands ( even those claimed organic or pesticide free! ) have recently been found to contain pesticides that are known carcinogens – in quantities above the US and EU limits! 
    A new study published in the journal of, Food Research International , found that cheaper blends contain enough fluoride to put people under the risk of many illnesses such as bone tooth, kidney problems and even cancer. 
    In fact, some brands of cheap tea contain nearly 7 parts per million (ppm) and the allowed level of fluoride is 4 ppm. This is quite scary since fluoride gets into your bones and accumulates in your body. It stays there for years. So how did fluoride get into tea? 
    The tea plant accumulates fluoride as it grows. This means that old leaves contain the most fluoride. Cheaper quality teas are often made from old leaves that contain more fluoride than young tea leaves (here is an example) . Additionally, these cheaper brands use smaller leaves which contain more fluoride. 
    And what about decaffeinated tea? 
    Well, decaffeinated tea showed higher fluoride levels than caffeinated tea. 
    So what is the solution? Should you stop drinking tea all together? Of course not! First of all, make sure to buy loose leaf tea and brew your tea from scratch. Bagged tea which might seem convenient and ready to go, is often made from low quality leaves which surely contain more fluoride. Stick to white tea (here) . It has the least amount of fluoride. Buy organic tea because the methods for cultivation are more sophisticated and conscious. They might even use purified water for the soil. We’ve just scratched the surface here, please check out Food Babe’s full report for more detailed information and a chart of which teas came out with their reputations intact – and please share with your tea-loving friends!
    """

    print(f"PyTorch version: {torch.__version__}")

    test_file = Path("test_text.txt")
    test_file.write_text(test_text)

    # # Create quiz agent
    # agent = QuizAgent()

    # print("=== Testing basic question generation ===")
    # questions = agent.generate_questions(test_file)
    # print(questions)

    # print("\n=== Testing OpenAI question generation ===")
    # # Only run OpenAI test if API key is available
    # api_key = os.getenv("OPENAI_API_KEY")
    # if api_key:
    #     ai_questions = agent.generate_questions_with_openai(test_file)
    #     print(ai_questions)
    # else:
    #     print("Skipping OpenAI test - no API key found in environment variables")

    # Load environment variables from .env
    load_dotenv()

    # # Access environment variables
    # api_key = os.getenv("OPENAI_API_KEY")
    # tavily_api_key = os.getenv("TAVILY_API_KEY")

    # if api_key and tavily_api_key:
    #     agent = ContentAnalysisAgent()
    #     agent.analyze_content(random_fake_article_2, api_key, tavily_api_key)
    # else:
    #     print("Skipping OpenAI test - no API key found in environment variables")


    # Experimenting with Reddit API Tool
    reddit_api_id = os.getenv("REDDIT_CLIENT_ID")
    reddit_api_secret = os.getenv("REDDIT_CLIENT_SECRET")
    reddit_user_agent = os.getenv("REDDIT_USER_AGENT")
    api_key = os.getenv("OPENAI_API_KEY")

    agent = SocialMediaAgent() 
    result = agent.analyze_social_media(random_fake_article_2, api_key, reddit_api_id, reddit_api_secret, reddit_user_agent)
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

    # Clean up test file
    test_file.unlink()
