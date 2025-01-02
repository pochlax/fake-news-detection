import argparse
import json
import os
import validators
import uuid
import copy
import firebase_admin
import google.cloud

from dotenv import load_dotenv
from src import utils as ut
# from src import agents
from pathlib import Path
from flask import Flask, request, jsonify
from src.agents import NewsAnalysisOrchestrator
from newspaper import Article
from urllib.parse import urlparse
from flask_cors import CORS
from datetime import datetime
from supabase import create_client, Client
from firebase_admin import credentials, firestore

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Initialize orchestrator
orchestrator = NewsAnalysisOrchestrator()

def extract_article_info(url: str) -> dict:
    """Extract article content, author, and publisher from URL using newspaper3k"""
    try:
        # Initialize article
        article = Article(url)
        article.download()
        article.parse()
        
        # Extract info
        return {
            "article": article.text,
            "author": article.authors[0] if article.authors else "Unknown",
            "publisher": urlparse(url).netloc.replace('www.', ''),
            "title": article.title.title(),
            "publish_date": str(article.publish_date) if article.publish_date else None
        }
    except Exception as e:
        raise ValueError(f"Failed to extract article info: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "news-analysis-api",
        "version": "1.0.0"
    }), 200

@app.route('/analyze', methods=['POST'])
def analyze_article():
    """Endpoint to analyze news article from URL"""
    try:
        # Get URL from request
        url = request.get_data(as_text=True)
        
        # # Validate URL
        # if not url or not validators.url(url):
        #     return jsonify({
        #         "error": "Invalid or missing URL",
        #         "status": "failed"
        #     }), 400
            
        # # Extract article information
        # article_info = extract_article_info(url)
        
        # # Run analysis
        # result = orchestrator.analyze_article(
        #     article=article_info['article'],
        #     author=article_info['author'],
        #     publisher=article_info['publisher']
        # )

        # result.update(article_info)

        # Opening JSON file
        f = open('./data/demo_output.txt')

        # returns JSON object as a dictionary
        result = json.load(f)

        if 'recommendation_score' in result:
            # After analysis is complete and you have the result:
            analysis_result = copy.deepcopy(result)
            analysis_result['article_id'] = str(uuid.uuid4())

            # Save to Supabase user_history
            user_history_data = {
                'id': str(uuid.uuid4()),
                # 'user_id': request.headers.get('user_id'),  # Assuming user_id is passed in headers
                'user_id': str(uuid.uuid4()),
                # 'article_id': 123,
                # 'article_title': "Pesticides in Tea",
                # 'recommendation': 70,
                'article_id': analysis_result['article_id'],
                'article_title': analysis_result['title'],
                'recommendation': analysis_result['recommendation_score'],
                'article_url': url
            }
            
            supabase.table('user_history').insert(user_history_data).execute()
            
            # Save to Firestore articles collection
            doc_ref = db.collection('articles').document(analysis_result['article_id'])
            doc_ref.set(analysis_result)
        
        return jsonify(result), 200

    except ValueError as ve:
        return jsonify({
            "error": str(ve),
            "status": "failed"
        }), 400
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "failed"
        }), 500

# Initialize Supabase and Firestore clients
supabase: Client = create_client(os.getenv('NEXT_PUBLIC_SUPABASE_URL'), os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY'))
cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
firebase_admin.initialize_app(cred)

db = firestore.client()

@app.route('/fetchHistory/<user_id>', methods=['GET'])
def fetch_history(user_id):
    try:
        # Query the user_history table from Supabase
        response = supabase.table('user_history') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('created_at', desc=True) \
            .execute()
        
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/fetchArticle/<article_id>', methods=['GET'])
def fetch_article(article_id):
    try:
        # Get article from Firestore
        # doc_ref = db.collection('articles').document(str(article_id))
        # doc = doc_ref.get()
        
        if doc.exists:
            return jsonify(doc.to_dict()), 200
        else:
            return jsonify({'error': 'Article not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "error": "Resource not found",
        "status": "failed"
    }), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({
        "error": "Internal server error",
        "status": "failed"
    }), 500

# def main(datadir):
#     # # Create output directory if it doesn't exist
#     # output_dir = Path(output)
#     # output_dir.mkdir(exist_ok=True)

#     # Load the input and output data
#     input_file = Path(datadir) / "demo_input.txt"

#     if not input_file.exists():
#         print(f"Error: Input file {input_file} not found")
#         return
#     # Read the article file
#     with open(input_file, "r", encoding="utf-8") as file:
#         article_text = file.read()

#     # Load environment variables from .env
#     load_dotenv()

#     # Access environment variables
#     api_key = os.getenv("OPENAI_API_KEY")
#     tavily_api_key = os.getenv("TAVILY_API_KEY")

#     # Load the agent
#     agent = agents.ContentAnalysisAgent()

#     # Generate Report Analysis of Article 
#     generated_report = agent.analyze_content(article_text, api_key, tavily_api_key)

#     output_file = Path(datadir) / "demo_output.txt"
#     with open(output_file, "a", encoding="utf-8") as f:
#         f.write(generated_report)
#         f.close()


    # Generate quizzes
    # generated_text = agent.generate_questions(text_path=input_file, num_questions=3)

    # # Save results
    # results = {
    #     "rouge_score": float(score),
    #     "generated_text": generated_text,
    #     "expected_text": expected_text,
    # }

    # output_file = output_dir / "pred_1.json"
    # with open(output_file, "w") as f:
    #     json.dump(results, f, indent=4)


if __name__ == "__main__":
    # parser = argparse.ArgumentParser(description="Fake News Detector")
    # parser.add_argument(
    #     "-d",
    #     "--datadir",
    #     type=str,
    #     default="data",
    #     help="Directory containing input data",
    # )
    # # parser.add_argument(
    # #     "-o",
    # #     "--output",
    # #     type=str,
    # #     default="results",
    # #     help="Output directory (default: results)",
    # # )

    # args = parser.parse_args()
    # main(args.datadir)


    # Get port from environment variable or use default
    port = int(os.getenv('PORT', 5000))
    
    # Run the app
    app.run(
        host='0.0.0.0',  # Makes the server publicly available
        port=port,
        debug=True  # Set to False in production
    )
