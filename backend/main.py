from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
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
from backend import validator
from backend.security import create_access_token, get_current_user

app = FastAPI(title="Career Weave API")

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")
logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIR = REPO_ROOT / "frontend"

# For local development, allow requests from any origin (supports local network IPs)
# Note: allow_origin_regex is used because allow_origins=["*"] is not compatible with allow_credentials=True
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
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
    return {
        "status": "Online",
        "message": "Career Weave API is ready."
    }


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
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not registered",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not db.verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    db.update_user_last_visit(user["id"])
    
    # NEW: Cleanup unfeasible roadmaps older than 72 hours on login
    deleted_expired = db.cleanup_expired_unfeasible_roadmaps(user["id"])
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "deleted_expired": deleted_expired
    }


# ==========================================
# ROADMAP GENERATION & HISTORY
# ==========================================

@app.post("/generate", response_model=schemas.CareerRoadmap)
def generate_roadmap_endpoint(
    request: schemas.ChatRequest, 
    current_user: dict = Depends(get_current_user)
):
    """
    Takes the user conversational prompt, extracts context, checks feasibility, and builds the roadmap.
    Persists data accurately strictly for the logged-in user.
    """
    logger.info(f"User {current_user['id']} requested roadmap generation.")
    
    # STEP 1: Context weave (AI Extraction Layer)
    raw_context = generator.weave_from_prompt(request.user_prompt)
    if not raw_context:
        raise HTTPException(status_code=500, detail="AI Extraction Failed. Please try again.")
        
    # STEP 2: Data Validation + Structuring Layer
    context = validator.validate_and_structure_context(raw_context, current_user)
         
    # STEP 3: Roadmap generate (with feasibility check)
    raw_roadmap = generator.generate_roadmap(context)
    if not raw_roadmap:
        raise HTTPException(status_code=500, detail="AI Generation Failed. Please try again.")
        
    # STEP 4: JSON Formatter & Final Validation
    roadmap = validator.format_roadmap_for_db(raw_roadmap)
        
    # STEP 5: Store in DB
    roadmap_id = db.save_complete_roadmap(current_user["id"], roadmap)
    if not roadmap_id:
         raise HTTPException(status_code=500, detail="Failed to save generated roadmap to database.")

    # STEP 6: Logic for unfeasible roadmaps
    # (No longer scheduling deletion here; handled by cleanup on login)
    if not roadmap.is_feasible:
         logger.info(f"Unfeasible roadmap generated for user {current_user['id']}. Will persist for 72h.")

    # STEP 7: Return the full roadmap with the new ID
    roadmap.id = roadmap_id
    return roadmap


@app.post("/generate/preview", response_model=schemas.CareerRoadmap)
def generate_roadmap_preview_endpoint(request: schemas.ChatRequest):
    """
    Generate a roadmap for unauthenticated users (preview).
    Does not store anything in the database.
    """
    logger.info("Unauthenticated user requested roadmap generation (preview).")
    
    raw_context = generator.weave_from_prompt(request.user_prompt)
    if not raw_context:
        raise HTTPException(status_code=500, detail="AI Extraction Failed. Please try again.")
        
    # Use a dummy user for validation step
    dummy_user = {"id": 0, "full_name": "Guest", "email": "guest@careerweave.com"}
    context = validator.validate_and_structure_context(raw_context, dummy_user)
         
    raw_roadmap = generator.generate_roadmap(context)
    if not raw_roadmap:
        raise HTTPException(status_code=500, detail="AI Generation Failed. Please try again.")
        
    roadmap = validator.format_roadmap_for_db(raw_roadmap)
    
    # We do NOT save it to DB, just return the JSON.
    return roadmap

@app.post("/roadmap/save-preview", response_model=schemas.CareerRoadmap)
def save_preview_roadmap_endpoint(
    roadmap_data: schemas.CareerRoadmap,
    current_user: dict = Depends(get_current_user)
):
    """
    Takes a previously generated preview roadmap JSON and saves it to the user's account.
    """
    logger.info(f"User {current_user['id']} is saving a preview roadmap.")
    
    roadmap_id = db.save_complete_roadmap(current_user["id"], roadmap_data)
    if not roadmap_id:
        raise HTTPException(status_code=500, detail="Failed to save preview roadmap to database.")

    if not roadmap_data.is_feasible:
         logger.info(f"Unfeasible roadmap saved for user {current_user['id']}. Will persist for 72h.")

    roadmap_data.id = roadmap_id
    return roadmap_data



@app.get("/examples", response_model=list[schemas.CareerRoadmap])
def get_examples():
    """Fetch all public/example roadmaps."""
    roadmaps = db.get_example_roadmaps()
    for r in roadmaps:
        r["curriculum"] = r.pop("milestones", [])
    return roadmaps


@app.get("/examples/roadmap/{roadmap_id}")
def get_specific_example_roadmap(roadmap_id: int):
    """Fetch a specific example roadmap publicly."""
    roadmap = db.get_roadmap_by_id(roadmap_id=roadmap_id)
    if not roadmap or not roadmap.get("is_example"):
        raise HTTPException(status_code=404, detail="Example roadmap not found.")
    
    # Process milestones through the same progress/lock logic, assuming all are unlocked for examples?
    # Or just return raw milestones, but RoadmapView expects 'curriculum'.
    roadmap["curriculum"] = roadmap.pop("milestones", [])
    return roadmap


@app.get("/history")
def get_user_history(current_user: dict = Depends(get_current_user)):
    """Fetch all past generated roadmaps for the current user."""
    roadmaps = db.get_all_user_roadmaps(current_user["id"])
    return roadmaps


@app.get("/history/summary")
def get_history_summary(current_user: dict = Depends(get_current_user)):
    """Lightweight roadmap summary for dashboard Recent Weaves cards. Includes pre-calculated completion percentage."""
    roadmaps = db.get_roadmap_history_summary(current_user["id"])
    return roadmaps


@app.get("/me")
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Returns the authenticated user's public profile for dashboard personalization."""
    return {
        "id": current_user["id"],
        "full_name": current_user["full_name"],
        "email": current_user["email"],
    }

@app.patch("/me/profile")
def update_profile(request: schemas.ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    """Update user's full name and email."""
    success = db.update_user_profile(current_user["id"], request.full_name, request.email)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update profile. Email might already be in use.")
    
    # Generate new token with updated email (subject)
    access_token = create_access_token(data={"sub": request.email})
    return {"message": "Profile updated successfully.", "access_token": access_token}

@app.patch("/me/password")
def update_password(request: schemas.PasswordUpdateRequest, current_user: dict = Depends(get_current_user)):
    """Update user's password after verifying the current one."""
    if not db.verify_password(request.current_password, current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect current password.")
        
    success = db.update_user_password(current_user["id"], request.new_password)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update password.")
    return {"message": "Password updated successfully."}

@app.delete("/me")
def delete_account(request: schemas.DeleteAccountRequest, current_user: dict = Depends(get_current_user)):
    """Delete the user account."""
    if not db.verify_password(request.password, current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect password.")
        
    success = db.delete_user(current_user["id"])
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete account.")
    return {"message": "Account deleted successfully."}


@app.get("/roadmap/{roadmap_id}")
def get_specific_roadmap(roadmap_id: int, current_user: dict = Depends(get_current_user)):
    """Fetch a specific roadmap. Computes realtime locked/unlocked progress states."""
    roadmap = db.get_roadmap_with_progress(user_id=current_user["id"], roadmap_id=roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found or you don't have access.")
    db.touch_roadmap_activity(roadmap_id, user_id=current_user["id"])
    roadmap["curriculum"] = roadmap.pop("milestones", [])
    return roadmap


@app.delete("/roadmap/{roadmap_id}")
def delete_roadmap_endpoint(roadmap_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a roadmap from your history."""
    success = db.delete_roadmap(roadmap_id, user_id=current_user["id"])
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete roadmap.")
    return {"message": "Roadmap deleted successfully."}


@app.patch("/roadmap/{roadmap_id}/pin")
def pin_roadmap_endpoint(
    roadmap_id: int, 
    request: schemas.RoadmapPinRequest, 
    current_user: dict = Depends(get_current_user)
):
    """Pin or unpin a roadmap in the sidebar."""
    success = db.update_roadmap_pin(roadmap_id, current_user["id"], request.is_pinned)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update roadmap pin status.")
    return {"message": "Roadmap pin status updated."}


@app.patch("/roadmap/{roadmap_id}/rename")
def rename_roadmap_endpoint(
    roadmap_id: int, 
    request: schemas.RoadmapRenameRequest, 
    current_user: dict = Depends(get_current_user)
):
    """Rename a roadmap's career goal."""
    success = db.rename_roadmap(roadmap_id, current_user["id"], request.new_name)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to rename roadmap.")
    return {"message": "Roadmap renamed successfully."}


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
    success = db.update_milestone_progress(
        milestone_id=milestone_id, 
        is_completed=progress.is_completed, 
        user_id=current_user["id"]
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update milestone. Check ownership.")
    return {"message": "Progress updated successfully."}