# de(fnd) - AI Powered Fake News Detector

![screenshot](imageFolder/logoBanner.png)

# Quick Start

## Frontend (NextJS)

### Setup

```bash
npm install
```

### Run

```bash
npm run dev
```

## Backend (Python)

### Setup

```bash
pip install -r requirements.txt
```

### Run

```python
python main.py
```

# Project Overview

In today's digital age, misinformation spreads rapidly, eroding trust and shaping public opinion. By combating false information, we help individuals and organizations make informed decisions and promote a healthier, truth-driven online ecosystem. Our application identifies fake news articles using AI-driven analysis, empowering users to discern fact from fiction.

## 1. Usage

1. Head over to the landing page.
2. Log in with Google OAuth Single Sign On.
3. Enter the URL of the news article you want to analyze.
4. Wait for the analysis to complete.
5. View the report.
6. (Optional) Download the report as a PDF.


## 2. Output

The output data is a report of the credibility level for the input article. The analysis is broken down into several sections; content analysis, source credibility and social media sentiment. The results of the sections will contirbute to the **final credibility score**.

## 3. Models Used

- OpenAI GPT-4o-mini

## 4. Technologies Used
- Python (Article, Transformers)
- Langchain & LangGraph
- Google OAuth Single Sign On
- NextJS
- TailwindCSS
- Google Firestore
- Supabase
