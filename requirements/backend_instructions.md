# Requirements
1. When the user makes call to the flask /fetchHistory endpoint, make a call to the user_history table to get the user's history. The user should pass a user_id which we will use to query the user_history table. See the schema of the database below.

CREATE TABLE user_history (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    article_id BIGINT NOT NULL,
    article_title TEXT NOT NULL,
    recommendation SMALLINT NOT NULL,
    article_url TEXT NOT NULL
);
The result of this query will be displayed on the analyzer page in the sidebar. 
2. When the user makes a call to the flask /analyze endpoint and the result is successful, make two calls to the following databases:
    - user_history: Insert the user_id, article_id, title, recommendation, and article_url into the user_history table. The table is SQL stored in Supabase.
    - articles: Insert the entire article JSON into the articles table. Use the article_id as the document id. The table is a NoSQL database stored in Cloud Firestore.
3. When the user makes a call to the flask /fetchArticle endpoint, the user will provide an article_id to get the specific article from the articles table. Use this article_id to query the articles table from Cloud Firestore.


