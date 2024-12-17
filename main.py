import argparse
import json
import os

from dotenv import load_dotenv
from src import utils as ut
from src import agents
from pathlib import Path


def main(datadir, output="results"):
    # # Create output directory if it doesn't exist
    # output_dir = Path(output)
    # output_dir.mkdir(exist_ok=True)

    # Load the input and output data
    input_file = Path(datadir) / "demo_input.txt"

    if not input_file.exists():
        print(f"Error: Input file {input_file} not found")
        return
    # Read the article file
    with open(input_file, "r", encoding="utf-8") as file:
        article_text = file.read()



    # Load environment variables from .env
    load_dotenv()

    # Access environment variables
    api_key = os.getenv("OPENAI_API_KEY")
    tavily_api_key = os.getenv("TAVILY_API_KEY")

    # Load the agent
    agent = agents.ContentAnalysisAgent()

    # Generate Report Analysis of Article 
    generated_report = agent.analyze_content(article_text, api_key, tavily_api_key)

    output_file = Path(datadir) / "demo_output.txt"
    with open(output_file, "a", encoding="utf-8") as f:
        f.write(generated_report)
        f.close()


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
    parser = argparse.ArgumentParser(description="Fake News Detector")
    parser.add_argument(
        "-d",
        "--datadir",
        type=str,
        default="data",
        help="Directory containing input data",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=str,
        default="results",
        help="Output directory (default: results)",
    )

    args = parser.parse_args()
    main(args.datadir, args.output)
