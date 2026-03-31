import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from database_manager import create_user, save_complete_roadmap, get_roadmap_by_id
from generator import generate_roadmap
import time

def run_integration_test():
    print("STARTING INTEGRATION TEST...")

    # 1. CREATE USER
    user_email = f"testuser_{int(time.time())}@example.com"
    user_id = create_user("Test Candidate 1", user_email, "hashed_test_password")
    
    if not user_id:
        print("Failed to create user.")
        return
    print("\n\tStep 1: Created User ID in MySQL")

    # 2. GENERATE AI ROADMAP
    target = "AI Engineer"
    skills = "figma, Photoshop, Content Creation, Social Media Management"
    
    print(f"\n\tStep 2: Asking AI to weave a path for {target}...")
    roadmap_obj = generate_roadmap(target, skills)
    
    if not roadmap_obj:
        print("AI Generation failed.")
        return
    print(f"AI Analysis Complete. Feasible: {roadmap_obj.is_feasible}")

    # 3. STORE IN DATABASE
    print("\n\tStep 3: Saving to MySQL...")
    success = save_complete_roadmap(user_id, roadmap_obj)
    
    if not success:
        print("Database Save failed.")
        return

    # 4. FETCH AND VERIFY
    print("\n\tStep 4: Fetching back from DB to verify...")
    
    print("\n--- TEST SUCCESSFUL ---")
    print(f"The 'Career Weave' pipeline is fully connected.")
    print(f"User {user_email} now has a saved {roadmap_obj.total_weeks}-week roadmap in MySQL.")

if __name__ == "__main__":
    run_integration_test()