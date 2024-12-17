# Fake News Detection

![screenshot](imageFolder/coverPhoto.jpg)

<!-- ## Quick Start -->

## Setup

```bash
pip install -r requirements.txt
```

## Run

```python
python main.py -d data/
```

# Overview for the Fake News Detection Project

In today's digital age, misinformation spreads rapidly, eroding trust and shaping public opinion. By combating false information, we help individuals and organizations make informed decisions and promote a healthier, truth-driven online ecosystem. Our application identifies fake news articles using AI-driven analysis, empowering users to discern fact from fiction.

## 1. Input Data

The input data is a text file containing the news article that is being verified by the Fake News Detection System. The text is a news article.

## 2. Output Data

The output data is a report of the credibility level for the input article. The analysis is broken down into several sections; content analysis, fact verification and social media analysis. The results of the sections will contirbute to the **final credibility score**.

## 3. Models Used

- OpenAI GPT-4o
- OpenAI GPT-4o-mini