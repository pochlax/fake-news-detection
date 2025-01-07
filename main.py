import argparse
import json
import os
import validators
import uuid
import copy
import firebase_admin
import google.cloud
# import requests
# import time

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
        
        # Get user_id from headers
        user_id = request.headers.get('user-id')
        if not user_id:
            return jsonify({
                "error": "User ID is required",
                "status": "failed"
            }), 400

        # Validate URL
        if not url or not validators.url(url):
            return jsonify({
                "error": "Invalid or missing URL",
                "status": "failed"
            }), 400
            
        # Extract article information
        article_info = extract_article_info(url)
        
        # Run analysis
        result = orchestrator.analyze_article(
            article=article_info['article'],
            author=article_info['author'],
            publisher=article_info['publisher']
        )

        result.update(article_info)

        ## FOR DEVELOPMENT ###
        # # Opening JSON file
        # f = open('./data/demo_output.txt')

        # returns JSON object as a dictionary
        # result = json.load(f)

        if 'recommendation_score' in result:
            # After analysis is complete and you have the result:
            analysis_result = copy.deepcopy(result)
            analysis_result['article_id'] = str(uuid.uuid4())

            # Save to Supabase user_history
            user_history_data = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,  # Use the user_id from headers
                'article_id': analysis_result['article_id'],
                'article_title': analysis_result['title'],
                'recommendation': analysis_result['recommendation_score'],
                'article_url': url
            }
            
            supabase.table('user_history').insert(user_history_data).execute()
            
            # Save to Firestore articles collection
            doc_ref = db.collection('articles').document(analysis_result['article_id'])
            doc_ref.set(analysis_result)

        # time.sleep(5)

        result['article_id'] = analysis_result['article_id']
        
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

@app.route('/auth/login/google', methods=['POST'])
def login_google():
    try:
        # Get data from request
        data = request.get_json()
        user_google_id = data.get('google_id')
        user_email = data.get('email')
        user_name = data.get('name')
        user_picture = data.get('picture', '')  # Default to empty string if no picture

        # Check if user exists in Supabase
        response = supabase.table('user_profile') \
            .select('*') \
            .eq('google_id', user_google_id) \
            .execute()

        if not response.data:
            # User doesn't exist, create new profile
            response = supabase.table('user_profile') \
                .insert({
                    'user_id': str(uuid.uuid4()),
                    'google_id': user_google_id,
                    'email': user_email,
                    'name': user_name,
                    'picture': user_picture
                }) \
                .execute()

        return jsonify({
            'user': response.data[0],
            'message': 'Authentication successful'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
        doc_ref = db.collection('articles').document(str(article_id))
        doc = doc_ref.get()
        
        if doc.exists:
            return jsonify(doc.to_dict()), 200
        else:
            return jsonify({'error': 'Article not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# @app.route('/proxy', methods=['GET'])
# def proxy():
#     # URL of the target website
#     target_url = "https://www.cbc.ca/news/canada/pesticide-traces-in-some-tea-exceed-allowable-limits-1.2564624"

#     try:
#         # Fetch the content from the target website
#         response = requests.get(target_url, headers={'User-Agent': 'Mozilla/5.0'})
#         response.raise_for_status()  # Check for HTTP request errors
#         return response.text  # Return the content of the target website
#     except requests.exceptions.RequestException as e:
#         # Handle errors and return a meaningful message
#         return jsonify({"error": str(e)}), 500

# # def proxy():
# #     # Build the full URL for the target request
# #     url = "https://www.cbc.ca/news/canada/pesticide-traces-in-some-tea-exceed-allowable-limits-1.2564624"

# #     # Forward the request to the target website
# #     try:
# #         response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, stream=True)
# #         response.raise_for_status()

# #         # Create a Flask Response with the same content and headers
# #         excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
# #         headers = {key: value for key, value in response.headers.items() if key.lower() not in excluded_headers}

# #         return Response(response.content, status=response.status_code, headers=headers)
# #     except requests.exceptions.RequestException as e:
# #         return Response(f"Error fetching content: {str(e)}", status=500)

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
