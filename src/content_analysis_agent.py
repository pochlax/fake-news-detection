from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from typing import List, Dict

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
        llm = ChatOpenAI(
            api_key=api_key,
            model="gpt-4o-mini",
            temperature=0.3
        )

        search = TavilySearchResults(max_results=1)
        tools = [search] 

        prompt = ChatPromptTemplate.from_messages([
            ("system", content_analysis_prompt),
            ("human", "Here's the article: {article}"),
            ("placeholder", "{agent_scratchpad}"),
        ])

        agent = create_tool_calling_agent(llm, tools, prompt)
        agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
        agent_result = agent_executor.invoke({"article": article})

        return agent_result 