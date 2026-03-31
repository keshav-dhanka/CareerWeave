import os
import json
from google.genai import Client
from dotenv import load_dotenv
from pydantic_core import ValidationError
from schemas import CareerRoadmap

# System instruction for the AI model, defining its role and constraints in generating career roadmaps.
SYSTEM_INSTRUCTION = """
### ROLE
You are the High-Integrity Career Architect for CareerWeave. You specialize in "Delta Analysis"—calculating the exact distance between a user's current technical stack and their professional aspirations. Your primary goal is to provide HONEST, realistic, and project-based roadmaps.

### CORE OPERATING PROTOCOLS

1. THE FEASIBILITY GATE (Priority 1):
   Before generating a curriculum, perform a "Reality Check" on the career jump.
   - DEFINITION OF IMPOSSIBLE: A jump from a Non-Technical/Soft-Skill background (e.g., Content Writing, Sales, basic Photoshop, Excel) to a High-Tier Engineering role (e.g., AI Engineer, DevOps Architect, Cybersecurity Lead) is impossible in 24 weeks.
   - IF UNREALISTIC: 
     * Set 'is_feasible' to false.
     * Set 'total_weeks' to 0.
     * Set 'curriculum' to [].
     * Populate 'feasibility_reasoning' with a brutalist, honest explanation of why this path requires years of foundation.
   - ELSE (If the jump is a Skill Polish, Pivot, or realistic Transformation):
     * Set 'is_feasible' to true.
     * Proceed to calculate 'total_weeks' and 'curriculum'.

2. DURATION SCALING:
   Scale the roadmap duration based on the technical gap:
   - Gap < 20% (Upskilling/Polish): 4–6 weeks.
   - Gap 20-50% (Pivoting): 8–12 weeks.
   - Gap > 50% (Transformation): 16–24 weeks.
   - STRICT LIMIT: Never exceed 24 weeks.

3. PEDAGOGY & TASK DESIGN:
   - Every week MUST center on a "Milestone Deliverable."
   - NEGATIVE CONSTRAINT: Do NOT suggest "watching videos" or "reading articles" as primary tasks. 
   - Tasks MUST be: "Build," "Code," "Configure," "Deploy," or "Optimize."

### OUTPUT CONSTRAINTS (STRICT)
- FORMAT: Return VALID JSON ONLY.
- NO MARKDOWN WRAPPERS: Do not use ```json or any text outside the JSON object.
- RESOURCES: Prioritize official documentation or specific GitHub repositories. If a URL is uncertain, provide a precise "Search Query" string.
- TONE: Technical, objective, and "Architect-level" precision.

### DATA SCHEMA REQUIREMENTS
- 'skill_gap_summary': A blunt assessment of specific missing technical competencies.
- 'difficulty': Beginner -> Intermediate -> Advanced (must progress logically).
- 'week_number': Strictly sequential integers starting at 1.
"""

# Load environment variables from .env file
load_dotenv()
gemini_api_key = os.getenv('GEMINI_API_KEY')

# Function to validate user input for career goal and current skills.
def is_input_valid(user_goal: str, current_skills: str) -> bool:
    goal = user_goal.strip()
    skills = current_skills.strip()

    has_goal_content = any(char.isalnum() for char in goal)
    has_skills_content = any(char.isalnum() for char in skills)

    return has_goal_content and has_skills_content

# Function to generate a career roadmap based on the user's goal and current skills.
def generate_roadmap(user_goal: str, current_skills: str, retries: int = 2) -> CareerRoadmap:
    if not is_input_valid(user_goal, current_skills):
         return CareerRoadmap(
            career_goal="Invalid",
            is_feasible=False,
            feasibility_reasoning="The input provided was either empty, too short, or contained only symbols.",
            current_skill_level="N/A",
            skill_gap_summary="Input contains insufficient or nonsensical data. Please try again.",
            total_weeks=0,
            curriculum=[]
        )
    attempt = 0
    while attempt <= retries:
        try:
            with Client(api_key=gemini_api_key) as client:        
                response = client.models.generate_content(
                    model="gemini-2.5-flash-lite",
                    config={
                        "system_instruction": SYSTEM_INSTRUCTION,
                        "response_mime_type": "application/json",
                        "response_schema": CareerRoadmap,
                    },
                    contents=f"I want to become a/an {user_goal}. I am currently skilled in : {current_skills}."
                )
                # Validates and returns the Python Object directly
                return CareerRoadmap.model_validate_json(response.text)
        
        except (ValidationError, json.JSONDecodeError) as e:
                attempt += 1
                print(f"Validation Failed (Attempt {attempt}): AI returned messy data. Retrying...")
                if attempt > retries:
                    print("Max retries reached. The AI is struggling with this specific input.")
                    return None
                
        except Exception as e:
            print(f"Connection/API Error: {e}")
            return None

# Example usage of the generate_roadmap function with test inputs. 
if __name__ == "__main__":
    roadmap = generate_roadmap("AI Engineer", "c")
    print("\n--- Career Weave: AI Roadmap Generator ---")
    if roadmap:
            if not roadmap.is_feasible:
                print("\n" + "!"*50)
                print("UNREALISTIC CAREER JUMP DETECTED")
                print(f"STATUS: {roadmap.career_goal}")
                print(f"REASONING: {roadmap.feasibility_reasoning}")
                print("!"*50)
                print("\nTip: Try a more foundational goal like first.")

            else:
                print("\n" + "="*50)
                print(f"TARGET ROLE: {roadmap.career_goal}")
                print(f"STARTING POINT: {roadmap.current_skill_level}")
                print(f"ANALYSIS: {roadmap.skill_gap_summary}")
                print(f"DURATION: {roadmap.total_weeks} Weeks")
                print("="*50 + "\n")

                # 2. Loop through the entire curriculum to see all weeks
                for node in roadmap.curriculum:
                    print(f"WEEK {node.week_number}: {node.topic}")
                    print(f"   Objective: {node.key_objective}")
                    print(f"   Task: {node.task}")
                    print(f"   Resource: {node.suggested_resource} ({node.resource_type})")
                    print(f"   Effort: {node.estimated_hours} hours")
                    print("-" * 30)
                print("\nRoadmap Generation Complete!")
    else:
        print("Failed to generate a roadmap. Please check your API connection and try again.")