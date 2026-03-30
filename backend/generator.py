import os
import json
from google.genai import Client
from dotenv import load_dotenv
from schemas import CareerRoadmap

# System instruction for the Gemini model to generate a career roadmap based on user input. This instruction guides the model to produce structured JSON output that aligns with the defined schema and provides actionable insights for the user's career development.
SYSTEM_INSTRUCTION = """
You are an elite Technical Career Coach and Curriculum Architect. Your goal is to help users bridge the gap between their current skills and their target career role.
Your Constraints:
1 Persona: Professional, encouraging, and highly technical.
2 Analysis: Compare the user's 'Current Skills' against the 'Target Role' to identify the specific 'Skill Gap'.
3 Output Format: You must output valid JSON ONLY. Do not include any introductory text, markdown formatting like ` ` ` json, or concluding remarks.
4 Data Integrity: Every field defined in the provided JSON schema must be populated.
5 Resources: For the 'suggested_resource' field, provide a specific, high-quality search query (e.g., 'Official Python Documentation for Decorators') or a reputable educational URL (e.g., Coursera, MDN, or documentation sites).
6 Logic: Ensure the 'week_number' is sequential and the 'difficulty' progresses logically from Beginner to Advanced.
"""

# Load environment variables from .env file
load_dotenv()
gemini_api_key = os.getenv('GEMINI_API_KEY', 'API_KEY_NOT_FOUND')

# Function to generate a career roadmap based on the user's goal and current skills.
def generate_roadmap(user_goal: str, current_skills: str) -> CareerRoadmap:
    try:
        with Client(api_key=gemini_api_key) as client:        
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                config={
                    "system_instruction": SYSTEM_INSTRUCTION,
                    "response_mime_type": "application/json",
                    "response_schema": CareerRoadmap,
                },
                contents=f"Goal: {user_goal}. My current skills are: {current_skills}."
            )
            # Validates and returns the Python Object directly
            return CareerRoadmap.model_validate_json(response.text)
    
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        return None

# Example usage of the generate_roadmap function with test inputs. 
if __name__ == "__main__":
    test_roadmap = generate_roadmap("AI Engineer", "Python, MySQL, UI/UX Design")
    print("\n--- 🧠 Career Weave: AI Roadmap Generator ---")
    if test_roadmap:
            print("\n" + "="*50)
            print(f"🎯 TARGET ROLE: {test_roadmap.career_goal}")
            print(f"📊 STARTING POINT: {test_roadmap.current_skill_level}")
            print(f"📝 ANALYSIS: {test_roadmap.skill_gap_summary}")
            print(f"⏳ DURATION: {test_roadmap.total_weeks} Weeks")
            print("="*50 + "\n")

            # 2. Loop through the entire curriculum to see all weeks
            for node in test_roadmap.curriculum:
                print(f"📅 WEEK {node.week_number}: {node.topic}")
                print(f"   🎯 Objective: {node.key_objective}")
                print(f"   🛠️ Task: {node.task}")
                print(f"   📚 Resource: {node.suggested_resource} ({node.resource_type})")
                print(f"   ⏱️ Effort: {node.estimated_hours} hours")
                print("-" * 30)
                
            print("\n✅ Roadmap Generation Complete!")