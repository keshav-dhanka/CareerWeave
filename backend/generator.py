import os
import json
import logging
from google.genai import Client
from dotenv import load_dotenv
from pydantic_core import ValidationError
from pydantic import BaseModel
from .schemas import CareerRoadmap, CareerContext
from .prompts import SYSTEM_INSTRUCTION, EXTRACTION_INSTRUCTION

logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()
gemini_api_key = os.getenv('GEMINI_API_KEY')
gemini_model_id = os.getenv('GEMINI_MODEL_ID')

def _gemini_generate_with_retry(system_instruction: str, prompt_contents: str, response_schema: type[BaseModel], retries: int = 3):
    """Unified handler for Gemini AI generation with generalized retry logic."""
    if not gemini_api_key or not gemini_model_id:
        logger.error("Environment configuration error: Missing Gemini API Keys.")
        return None

    attempt = 0
    while attempt < retries:
        try:
            with Client(api_key=gemini_api_key) as client:
                response = client.models.generate_content(
                    model=gemini_model_id,
                    config={
                        "system_instruction": system_instruction,
                        "response_mime_type": "application/json",
                        "response_schema": response_schema,
                    },
                    contents=prompt_contents
                )
                return response_schema.model_validate_json(response.text)

        except (ValidationError, json.JSONDecodeError) as e:
            attempt += 1
            logger.warning(f"AI Schema/JSON Error. Retrying... (Attempt {attempt}/{retries}). Exception: {e}")
            if attempt >= retries:
                logger.error("Max retries reached. The AI is struggling with this specific input structure.")
                return None

        except Exception as e:
            error_str = str(e).lower()
            if "400" in error_str or "api key not valid" in error_str:
                attempt += 1
                logger.warning(f"API Key Error (400). Retrying... (Attempt {attempt}/{retries})")
            elif "503" in error_str or "overloaded" in error_str:
                attempt += 1
                logger.warning(f"Server Busy (503). Retrying... (Attempt {attempt}/{retries})")
            else:
                logger.error(f"Unexpected AI Client Error: {e}")
                return None
            
    logger.error("Max retries reached. Please try again later.")
    return None


def weave_from_prompt(user_prompt: str) -> CareerContext | None:
    """Extracts structured identity, skills, and goals from free-form user text."""
    return _gemini_generate_with_retry(
        system_instruction=EXTRACTION_INSTRUCTION,
        prompt_contents=user_prompt,
        response_schema=CareerContext
    )


def generate_roadmap(brief: CareerContext) -> CareerRoadmap | None:
    """Calculates a skills gap mapping based on a CareerContext briefing."""
    prompt = f"""
    You are designing a professional path for the following subject:

        - **Subject Name**: {brief.target_name}
        - **Educational Foundation**: {brief.target_degree}
        - **Current Technical Competencies**: {brief.current_skills}
        - **Aspirational Target Role**: {brief.target_role}

    TASK:
        Perform a Delta Analysis comparing the {brief.current_skills} against the {brief.target_role} industry requirements. Construct a week-by-week technical curriculum that bridges this gap with 100% focus on project-based deliverables.
    """
    return _gemini_generate_with_retry(
        system_instruction=SYSTEM_INSTRUCTION,
        prompt_contents=prompt,
        response_schema=CareerRoadmap
    )