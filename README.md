# Fake News Detection

## Quick Start

## Setup

```bash
pip install -r requirements.txt
```

## Run

```python
python main.py -d data/ -o results/
```

## Overview for the Fake News Detection Project

This project is a simple implementation of a quiz generation system using a language model. The system takes an input text and generates a quiz based on the text. The quiz is then compared to an expected output to evaluate the performance of the system. 

## 1. Input Data Used

The input data is a text file containing the news article that is being verified by the Fake News Detection System. The text is a news article .

## 2. Output Data

The output data is a report of the credibility level for the input article. The analysis is broken down into several sections; content analysis, fact verification and social media analysis. The results of the sections will contirbute to the final credibility score.

## 3. Models Used

- OpenAI GPT-4o
- OpenAI GPT-4o-mini

## 4. Evaluation Method

The ROUGE-1 F1 score is used to evaluate the performance of the system. The score is calculated by comparing the generated quiz to the expected output.
