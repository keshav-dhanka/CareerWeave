from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class RoadmapNode(BaseModel):
    milestone_id: int = Field(description="Unique ID for this node (1, 2, 3...)")
    week_number: int = Field(description="Sequential week (1, 2, 3...)")
    topic: str = Field(description="High-level subject title")
    key_objective: str = Field(description="The primary outcome or skill gained this week")
    task: str = Field(description="A specific project or practical exercise to complete")

    # Optional fields for enhanced learning experience
    project_milestone: Optional[str] = Field(description="The name of the small project being built this week")
    prerequisites: List[str] = Field(description="Skills or topics needed before starting this week")
    
    # UI & Logic Fields
    difficulty: str = Field(description="Level: Beginner, Intermediate, or Advanced")
    estimated_hours: int = Field(description="Total hours required to finish the tasks")
    is_completed: bool = Field(default=False, description="Tracking status for the UI")
    tags: List[str] = Field(description="Category tags (e.g., #Python, #API, #UX)")
    
    # Resource Fields
    resource_type: str = Field(description="Video, Article, Documentation, or Lab")
    suggested_resource: str = Field(description="A specific search query or URL for the material")

class CareerRoadmap(BaseModel):
    career_goal: str = Field(description="The professional target (e.g., 'AI Engineer')")
    is_feasible: bool = Field(description="True if the goal is reachable in 24 weeks, False if it's an impossible jump")
    feasibility_reasoning: str = Field(description="Explanation of why the path is or isn't realistic")
    current_skill_level: str = Field(description="The user's current level (Beginner, Intermediate, etc.)")
    skill_gap_summary: str = Field(description="A brief explanation of what the user is missing to reach their goal")
    total_weeks: int = Field(description="Total duration of the generated plan")
    curriculum: List[RoadmapNode] = Field(description="The week-by-week learning nodes")

class RoadmapRequest(BaseModel):
    user_id: int
    target_role: str
    current_skills: str

class UserSignup(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str