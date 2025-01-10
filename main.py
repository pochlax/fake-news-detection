import argparse
import json
import os
import validators
import uuid
import copy
import firebase_admin
import google.cloud
# import time

from dotenv import load_dotenv
from src import utils as ut
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

        return {
            "article": article.text,
            "author": article.authors[0] if article.authors else "Unknown",
            "publisher": urlparse(url).netloc.replace('www.', ''),
            "title": article.title.title(),
            "publish_date": str(article.publish_date) if article.publish_date else None,
            "topImage": article.top_image if article.top_image else None
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
            publisher=article_info['publisher'],
            topImage= article_info['topImage']
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


if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.getenv('PORT', 5000))
    
    # Run the app
    app.run(
        host='0.0.0.0',  # Makes the server publicly available
        port=port,
        debug=True  # Set to False in production
    )
