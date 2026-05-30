import re
import logging
from fastapi import HTTPException, status
from backend.schemas import CareerContext, CareerRoadmap

logger = logging.getLogger(__name__)

def clean_text(text: str) -> str:
    """Clean up text from potential LLM artifacts like markdown or extra quotes."""
    if not text:
        return ""
    # Remove markdown code blocks if any
    text = re.sub(r'```[a-zA-Z]*\n', '', text)
    text = re.sub(r'```', '', text)
    # Remove leading/trailing quotes and spaces
    return text.strip(' "\'')

def validate_and_structure_context(context: CareerContext, current_user: dict) -> CareerContext:
    """
    Validates and structures the extracted context before passing it to the Roadmap Generator.
    Ensures that the LLM output is structurally sound, logically correct, and sanitized.
    """
    logger.info("Running Data Validation + Structuring Layer on extracted context.")

    # 1. Clean up strings
    context.target_name = clean_text(context.target_name)
    context.target_degree = clean_text(context.target_degree)
    context.target_role = clean_text(context.target_role)
    context.current_skills = clean_text(context.current_skills)

    # 2. Inject real user identity if AI defaulted to "Explorer" or left it blank
    if context.target_name.lower() in ["explorer", "unknown", "n/a", "not provided", ""]:
        logger.info(f"Using DB Fallback Name: {current_user['full_name']}")
        context.target_name = current_user['full_name']

    # 3. Validate Target Role
    invalid_roles = ["not provided", "unknown", "n/a", "none", ""]
    if context.target_role.lower() in invalid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="What's your dream role? Please specify a clear job title (e.g., Frontend Developer)!"
        )

    # 4. Validate Background & Skills combination
    empty_backgrounds = ["open background", "not provided", "unknown", "n/a", "none", ""]
    empty_skills = ["none", "not provided", "unknown", "n/a", ""]
    
    if context.target_degree.lower() in empty_backgrounds and context.current_skills.lower() in empty_skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Tell us about your background! Please share some current skills and education so we can tailor your path."
        )

    # Provide helpful fallbacks if only one is missing, so the Roadmap AI has better context
    if context.target_degree.lower() in empty_backgrounds:
        context.target_degree = "Self-Taught / No formal background specified"

    if context.current_skills.lower() in empty_skills:
        context.current_skills = "Beginner / No prior technical skills mentioned"

    # 5. Structure skills into a more uniform comma-separated list
    skills_list = [s.strip() for s in context.current_skills.split(',') if s.strip()]
    if skills_list:
        context.current_skills = ", ".join(skills_list)

    # 6. Normalize roles and degrees to title case for better prompting later
    context.target_role = context.target_role.title()
    
    return context

def format_roadmap_for_db(roadmap: CareerRoadmap) -> CareerRoadmap:
    """
    JSON Formatter & Final Validation Layer before persisting to the Database.
    Ensures that all roadmap nodes have correct structures, safe strings, and 
    logical week sequences.
    """
    logger.info("Running JSON Formatter & Final Validation on Roadmap.")
    
    roadmap.target_name = clean_text(roadmap.target_name)
    roadmap.career_goal = clean_text(roadmap.career_goal)
    roadmap.skill_gap_summary = clean_text(roadmap.skill_gap_summary)
    roadmap.feasibility_reasoning = clean_text(roadmap.feasibility_reasoning)
    
    # Fix week numbers sequentially just in case LLM skipped or duplicated weeks
    expected_week = 1
    for node in roadmap.curriculum:
        node.week_number = expected_week
        node.topic = clean_text(node.topic)
        node.key_objective = clean_text(node.key_objective)
        node.task = clean_text(node.task)
        
        # Ensure default values for UI safety
        if node.difficulty not in ["Beginner", "Intermediate", "Advanced"]:
            node.difficulty = "Intermediate"  # Safe default
            
        if node.estimated_hours <= 0:
            node.estimated_hours = 10  # Safe default assumption

        # Clean resources
        for res in node.resources:
            res.type = clean_text(res.type)
            res.title = clean_text(res.title)
            res.url_or_query = clean_text(res.url_or_query)

        expected_week += 1
    
    # Ensure total_weeks matches actual length
    roadmap.total_weeks = len(roadmap.curriculum)
    
    return roadmap