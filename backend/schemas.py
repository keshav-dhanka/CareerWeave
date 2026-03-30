from pydantic import BaseModel, Field
from typing import List

class RoadmapNode(BaseModel):
    milestone_id: int = Field(description="Unique ID for this node (1, 2, 3...)")
    week_number: int = Field(description="Sequential week (1, 2, 3...)")
    topic: str = Field(description="High-level subject title")
    key_objective: str = Field(description="The primary outcome or skill gained this week")
    task: str = Field(description="A specific project or practical exercise to complete")
    
    # UI & Logic Fields
    difficulty: str = Field(description="Level: Beginner, Intermediate, or Advanced")
    estimated_hours: int = Field(description="Total hours required to finish the tasks")
    is_completed: bool = Field(default=False, description="Tracking status for the UI")
    
    # Resource Fields
    resource_type: str = Field(description="Video, Article, Documentation, or Lab")
    suggested_resource: str = Field(description="A specific search query or URL for the material")

class CareerRoadmap(BaseModel):
    career_goal: str = Field(description="The professional target (e.g., 'AI Engineer')")
    current_skill_level: str = Field(description="The user's current level (Beginner, Intermediate, etc.)")
    skill_gap_summary: str = Field(description="A brief explanation of what the user is missing to reach their goal")
    total_weeks: int = Field(description="Total duration of the generated plan")
    curriculum: List[RoadmapNode] = Field(description="The week-by-week learning nodes")