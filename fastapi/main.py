from fastapi import FastAPI, BackgroundTasks, HTTPException, Request
from typing import Dict, Any, Union, List
from custom_types import ChatQnA
import asyncio
from pydantic import BaseModel
from agents.llm_togetherai import analyze_info

import sys
import os
from pathlib import Path
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Setup path resolution
API_DIR = Path(__file__).parent
ROOT_DIR = API_DIR.parent
sys.path.append(str(API_DIR))

# Load environment variables
load_dotenv(ROOT_DIR / '.env')

current_file_path = os.path.abspath(__file__)
parent_directory = os.path.dirname(os.path.dirname(current_file_path))
sys.path.append(parent_directory)
sys.path.append(f"{parent_directory}/fastapi")
# sys.path.append(f"{parent_directory}/fastapi/agent")

# from agent.test_basic_agent import get_user_info
# from agent.workflow import end_to_end_agent

app = FastAPI()

@app.get("/api/py/")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

class AnswersRequest(BaseModel):
    answers: str

# @app.get("/api/py/extract-info")
@app.post("/api/py/extract-info")
# async def extract_info(question: str, answer: str):
# async def extract_info(answers: str):
async def extract_info(request: AnswersRequest):
  # logging.info(f"Extract info called with for question: {question}, answer: {answer}")
  # print(f"Extract info called with for question: {question}, answer: {answer}")
  
  logging.info(f"Extract info called with answers: {request.answers}")
  print(f"Extract info called with answers: {request.answers}")

  try:
      async with asyncio.timeout(50): 
        print("Before calling analyze QnA info")
        # extracted_info = await asyncio.create_task(analyze_info(question, answer))
        extracted_info = await asyncio.create_task(analyze_info(request.answers))
        logging.info("Extracted info in extract_info:")
        print("Extracted info in extract_info:")
        print(extracted_info)

        logging.info(f"Info extracted successfully: {extracted_info}")
        return {"extracted_info": extracted_info}
  # except asyncio.TimeoutError:
  #     logging.error("Info extraction timed out after 50 seconds")
      raise HTTPException(status_code=504, detail="Info extraction timed out")
  except Exception as e:
      logging.error(f"Error extracting info: {str(e)}")
      import traceback
      logging.error(f"Traceback: {traceback.format_exc()}")
      raise HTTPException(status_code=500, detail=str(e))
