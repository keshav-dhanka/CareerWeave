from pydantic import BaseModel, EmailStr, Field

# ==========================================
# Roadmap & AI Generation Schemas
# ==========================================

class MilestoneResource(BaseModel):
    type: str = Field(description="Video, Article, Documentation, Lab, Audio, Learning by Doing, etc.")
    title: str = Field(description="Title or brief description of the resource")
    url_or_query: str = Field(description="A specific search query, video details, direct URL, or identifier for the material")

class RoadmapNode(BaseModel):
    """Weekly roadmap node representing a single milestone."""
    milestone_id: int | None = Field(default=None, description="Unique ID for this node (optional; DB assigns IDs)")
    week_number: int = Field(description="Sequential week (1, 2, 3...)")
    topic: str = Field(description="High-level subject title")
    key_objective: str = Field(description="The primary outcome or skill gained this week")
    task: str = Field(description="A specific project or practical exercise to complete")

    # Optional fields for enhanced learning experience
    project_milestone: str | None = Field(default=None, description="The name of the small project being built this week")
    prerequisites: list[str] = Field(default_factory=list, description="Skills or topics needed before starting this week")
    
    # UI & Logic Fields
    difficulty: str = Field(description="Level: Beginner, Intermediate, or Advanced")
    estimated_hours: int = Field(description="Total hours required to finish the tasks")
    is_completed: bool = Field(default=False, description="Tracking status for the UI")
    is_locked: bool = Field(default=False, description="True until prior weeks are completed (computed server-side for saved roadmaps)")
    tags: list[str] = Field(default_factory=list, description="Category tags (e.g., #Python, #API, #UX)")
    
    # Resource Fields
    resources: list[MilestoneResource] = Field(description="A comprehensive list of diverse, free-to-use learning resources for the week")


class CareerRoadmap(BaseModel):
    """The main response schema for the career roadmap API."""
    target_name: str = Field(description="The name of the person this roadmap is for")
    target_degree: str = Field(description="The education/experience level extracted from the prompt")
    career_goal: str = Field(description="The professional target (e.g., 'AI Engineer')")
    is_feasible: bool = Field(description="True if the goal is reachable in 24 weeks, False if it's an impossible jump")
    feasibility_reasoning: str = Field(description="Explanation of why the path is or isn't realistic")
    current_skill_level: str = Field(description="The user's current level (Beginner, Intermediate, etc.)")
    skill_gap_summary: str = Field(description="A brief explanation of what the user is missing to reach their goal")
    total_weeks: int = Field(description="Total duration of the generated plan")
    curriculum: list[RoadmapNode] = Field(description="The week-by-week learning nodes")


class CareerContext(BaseModel):
    """The AI-extracted technical briefing from the user's free-form chat."""
    target_name: str = Field(description="The user's name")
    target_degree: str = Field(description="The user's current education or experience background")
    target_role: str = Field(description="The user's desired career goal")
    current_skills: str = Field(description="A comma-separated list of the user's current skills")

# ==========================================
# Request payload Schemas
# ==========================================

class ChatRequest(BaseModel):
    user_id: int
    user_prompt: str


class MilestoneProgressRequest(BaseModel):
    is_completed: bool = Field(description="Mark this week as finished or reopen it")


# ==========================================
# Authentication Schemas
# ==========================================

class UserSignup(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str