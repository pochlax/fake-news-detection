export interface RedditPost {
    score: number;
    sentiment: {
        average_score: number;
        negative: number;
        neutral: number;
        positive: number;
    };
    title: string;
    url: string;
}

export interface AnalysisData {
    article: string;
    article_id: string;
    article_summary: string;
    author: string;
    author_publisher_explanation: string;
    author_trustability: string;
    bias: string;
    bias_explanation: string;
    content_analysis: string;
    content_analysis_biblio: string[];
    facts_dict: string[];
    input_article: string;
    input_author: string;
    input_publisher: string;
    input_topImage: string;
    non_facts_dict: string[];
    opinions_dict: string[];
    publish_date: string;
    publisher: string;
    publisher_trustability: string;
    recommendation: string;
    recommendation_score: number;
    reddit_comments_sentiment: string;
    reddit_posts: RedditPost[];
    reddit_sentiment_summary: string;
    reddit_sentiment_value: number;
    social_media_analysis: string;
    source_analysis: string;
    source_analysis_biblio: string[];
    supported_claims: string;
    title: string;
    tone: string;
    tone_explanation: string;
    topImage: string;
} 