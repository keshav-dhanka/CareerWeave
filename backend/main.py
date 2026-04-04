from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import logging
from pathlib import Path

# Local imports
from backend import database_manager as db
from backend import schemas
from backend import generator
from backend.security import create_access_token, get_current_user

app = FastAPI(title="Career Weave API")

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")
logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIR = REPO_ROOT / "frontend"

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR), html=False), name="static")

@app.get("/", include_in_schema=False)
def frontend_index():
    index = FRONTEND_DIR / "index.html"
    if index.exists():
        return FileResponse(str(index))
    return {"status": "Online", "message": "Career Weave API is ready."}

@app.get("/api/health")
def health():
    return {"status": "Online", "message": "Career Weave API is ready."}


# ==========================================
# AUTHENTICATION ROUTES
# ==========================================

@app.post("/signup", response_model=dict)
def signup(user_data: schemas.UserSignup):
    """Register a new user and return an auto-login JWT token."""
    user_id = db.create_user(user_data.full_name, user_data.email, user_data.password)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered or invalid data."
        )
    
    # Auto-login the user after signup by returning a valid token
    access_token = create_access_token(data={"sub": user_data.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/login", response_model=dict)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """OAuth2 compatible login endpoint. Returns JWT token."""
    user = db.get_user_by_email(form_data.username) # form_data.username acts as the email
    
    if not user or not db.verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    db.update_user_last_visit(user["id"])
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}


# ==========================================
# ROADMAP GENERATION & HISTORY
# ==========================================

@app.post("/generate", response_model=schemas.CareerRoadmap)
def generate_roadmap_endpoint(request: schemas.ChatRequest, current_user: dict = Depends(get_current_user)):
    """
    Takes the user conversational prompt, extracts context, checks feasibility, and builds the roadmap.
    Persists data accurately strictly for the logged-in user.
    """
    logger.info(f"User {current_user['id']} requested roadmap generation.")
    
    # STEP 1: Context weave
    context = generator.weave_from_prompt(request.user_prompt)
    if not context:
        raise HTTPException(status_code=500, detail="AI Extraction Failed. Please try again.")
        
    # Inject real user identity if AI defaulted to "Explorer" due to lack of name in prompt
    if context.target_name.lower() == "explorer":
        logger.info(f"Using DB Fallback Name: {current_user['full_name']}")
        context.target_name = current_user['full_name']
        
    if context.target_role == "Not Provided":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="We could not detect a target role. Please be specific about the job title you want!"
        )
        
    if context.target_degree.lower() == "open background" and context.current_skills.lower() == "none":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="We could not detect any current skills or educational background. Please provide your current expertise or education level so we can build a meaningful roadmap."
        )
         
    # STEP 2: Roadmap generate
    roadmap = generator.generate_roadmap(context)
    if not roadmap:
        raise HTTPException(status_code=500, detail="AI Generation Failed. Please try again.")
        
    # STEP 3: Store in DB
    success = db.save_complete_roadmap(current_user["id"], roadmap)
    if not success:
         raise HTTPException(status_code=500, detail="Failed to save generated roadmap to database.")

    return roadmap


@app.get("/history")
def get_user_history(current_user: dict = Depends(get_current_user)):
    """Fetch all past generated roadmaps for the current user."""
    roadmaps = db.get_all_user_roadmaps(current_user["id"])
    return roadmaps


@app.get("/roadmap/{roadmap_id}")
def get_specific_roadmap(roadmap_id: int, current_user: dict = Depends(get_current_user)):
    """Fetch a specific roadmap. Enforces ownership check to prevent IDOR."""
    roadmap = db.get_roadmap_by_id(roadmap_id, user_id=current_user["id"])
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found or you don't have access.")
    return roadmap


@app.delete("/roadmap/{roadmap_id}")
def delete_roadmap_endpoint(roadmap_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a roadmap from your history."""
    success = db.delete_roadmap(roadmap_id, user_id=current_user["id"])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete roadmap.")
    return {"message": "Roadmap deleted successfully."}


# ==========================================
# PROGRESS SCORING
# ==========================================

@app.patch("/milestone/{milestone_id}")
def update_progress(
    milestone_id: int, 
    progress: schemas.MilestoneProgressRequest, 
    current_user: dict = Depends(get_current_user)
):
    """Mark a week as completed or uncompleted. Ensures user ownership to prevent tampering."""
    # We use the safe function we modified earlier to prevent IDOR!
    success = db.update_milestone_status(
        milestone_id=milestone_id, 
        is_completed=progress.is_completed, 
        user_id=current_user["id"]
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update milestone. Check ownership.")
    return {"message": "Progress updated successfully."}