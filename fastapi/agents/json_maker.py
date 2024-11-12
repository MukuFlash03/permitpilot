from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv
import os
import json
from together import Together
import sys
import os
from pathlib import Path
from dotenv import load_dotenv
import logging
from custom_types import BusinessDetails

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_DIR = Path(__file__).parent
ROOT_DIR = API_DIR.parent
sys.path.append(str(API_DIR))

load_dotenv(ROOT_DIR / '.env')

current_file_path = os.path.abspath(__file__)
parent_directory = os.path.dirname(os.path.dirname(current_file_path))
sys.path.append(parent_directory)
sys.path.append(f"{parent_directory}/backend")

load_dotenv() 

client = Together(api_key=os.getenv("TOGETHER_API_KEY"))

class ChatQnA(BaseModel):
    question: str
    answer: str

async def extract_business_details(transcript: str):
    extract = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "you are a helpful assistant trying to take context out of a statement. only extract what they say, don't debate it. Only answer in JSON."
            },
            {
                "role": "user",
                "content": transcript,
            },
        ],
        model="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        response_format={
                "type": "json_object",
                "schema": BusinessDetails.model_json_schema(),
            }
    )

    return json.loads(extract.choices[0].message.content)

async def create_business_json(transcript: str):
    print("Before extract_business_details LLM call")
    result = await extract_business_details(transcript)
    print("After extract_business_details LLM call")

    print(sys.path[0])
    # directory = sys.path[0]
    # file_path = os.path.join(directory, 'business_details.json')

    directory = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(current_file_path))), 'src', 'lib')
    file_path = os.path.join(directory, 'business_details.json')

    print("Before trying to open JSON file")
    with open(file_path, 'w') as json_file:
        json.dump(result, json_file, indent=4)
    print("After trying to open JSON file")

    print("Json file created in file path:", file_path)

    print(f"Extracted Business Details:\n{result}")

    final_result = {
        "extracted_data": result,
        "file_path": file_path
    }

    print(f"Final Result:\n{final_result}")

    return final_result

# def main():
#     # Get user input
#     transcript = input("Please enter the transcript text: ")

#     # Extract business details
#     result = extract_business_details(transcript)

# # business page at /src/app/business/page.tsx
#     # Save the dictionary to a JSON file
#     # Define the file path
#    # file_path = 'business_details.json'

#     # Ensure the directory exists
#    # os.makedirs(os.path.dirname(file_path), exist_ok=True)

#     # Save the dictionary to a JSON file
#    # with open(file_path, 'w') as json_file:
#     directory = sys.path[0] # This is usually the current directory or Python environment

#     print(sys.path[0])

#     # Create the full file path
#     file_path = os.path.join(directory, 'business_details.json')

#     # Define the file path (it could be a directory within your project or elsewhere)
#     #'file_path = sys.path + 'business_details.json'  # This will save to the current directory

#     # Open the file and write the result as JSON
#     with open(file_path, 'w') as json_file:
#         json.dump(result, json_file, indent=4)

#     #json.dump(result, sys.path 'business_details.json', indent=4)

#     #print(result)

#     # Print the extracted result
#     print(f"Extracted Business Details:\n{result}")


# if __name__ == "__main__":
#     main()
