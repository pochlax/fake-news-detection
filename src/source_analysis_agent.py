from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from typing import List, Dict

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
        llm = ChatOpenAI(
            api_key=api_key,
            model="gpt-4o-mini",
            temperature=1
        )

        search = TavilySearchResults(max_results=1)
        tools = [search] 

        prompt = ChatPromptTemplate.from_messages([
            ("system", source_analysis_prompt),
            ("human", "Here's the author's name: {author} and the publishing company: {publisher}"),
            ("placeholder", "{agent_scratchpad}"),
        ])

        agent = create_tool_calling_agent(llm, tools, prompt)
        agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
        agent_result = agent_executor.invoke({"author": author, "publisher": publisher})

        return agent_result 