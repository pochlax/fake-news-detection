from langchain_openai import ChatOpenAI

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
"""

class ReportWriterAgent:
    def __init__(self, api_key: str):
        self.llm = ChatOpenAI(temperature=0, model="gpt-4o-mini", api_key=api_key)
    
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

        json_str = response.replace('```json', '').replace('```', '').strip()
        return json_str 