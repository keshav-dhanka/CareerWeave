from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from generator import generate_roadmap
from database_manager import create_user, get_user_by_email, save_complete_roadmap, hash_password, verify_password
from schemas import RoadmapRequest, UserSignup, UserLogin

app = FastAPI(title="Career Weave API")

origins = [
    "http://localhost:3000", # Standard React port
    "http://localhost:5173", # Standard Vite port (highly recommended)
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows GET, POST, DELETE, etc.
    allow_headers=["*"], # Allows all headers
)

@app.get("/")
def home():
    return {"status": "Online", "message": "Career Weave Architect is ready."}

# 2. The Core "Magic" Endpoint
@app.post("/generate-roadmap")
def create_roadmap(request: RoadmapRequest):
    """
    The main flow: 
    Receive Input -> Call Gemini -> Save to MySQL -> Return JSON
    """
    # Step A: Generate the AI Roadmap
    print(f"🧠 Generating roadmap for Role: {request.target_role}")
    roadmap_obj = generate_roadmap(request.target_role, request.current_skills)
    
    if not roadmap_obj:
        raise HTTPException(status_code=500, detail="AI failed to generate roadmap")

    # Step B: Save to Database
    print(f"💾 Saving roadmap to Database for User: {request.user_id}")
    success = save_complete_roadmap(request.user_id, roadmap_obj)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save to database")

    # Step C: Return the roadmap to the Frontend
    return {
        "message": "Roadmap successfully weaved and saved!",
        "data": roadmap_obj
    }

# 3. Signup Endpoint
@app.post("/auth/signup")
def signup(user: UserSignup):
    success = create_user(user.full_name, user.email, user.password)
    if not success:
        raise HTTPException(status_code=400, detail="Email already registered or Database error")
    return {"message": "Account created successfully! You can now log in."}

# 4. Login Endpoint
@app.post("/auth/login")
def login(user: UserLogin):
    db_user = get_user_by_email(user.email)
    
    if not db_user or not verify_password(user.password, db_user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "message": "Login successful",
        "user": {
            "id": db_user['id'],
            "full_name": db_user['full_name'],
            "email": db_user['email']
        }
    }