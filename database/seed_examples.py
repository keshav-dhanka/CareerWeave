import sys
import json
from pathlib import Path
import mysql.connector
import os
from dotenv import load_dotenv

# Add backend directory to sys.path so we can import db functions (like hash_password)
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend import database_manager as db

load_dotenv()

def seed_database():
    json_path = Path(__file__).resolve().parent / "example_roadmaps.json"
    
    if not json_path.exists():
        print(f"Error: {json_path} not found. Please run 'python extract_examples.py' first to generate the JSON.")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        roadmaps = json.load(f)
        
    if not roadmaps:
        print("No roadmaps found in JSON.")
        return

    # 1. Connect to DB
    conn = db.get_db_connection()
    if not conn:
        print("Database connection failed. Check your .env credentials.")
        return
        
    try:
        conn.autocommit = False
        cursor = conn.cursor()
        
        # 2. Check if Dummy User exists, if not create it
        dummy_email = "examples@careerweave.com"
        cursor.execute("SELECT id FROM users WHERE email = %s", (dummy_email,))
        user_row = cursor.fetchone()
        
        if user_row:
            dummy_user_id = user_row[0]
            print(f"Found existing dummy user (ID: {dummy_user_id}).")
        else:
            print("Creating dummy user for examples...")
            hashed_pwd = db.hash_password("DummyPassword123!")
            cursor.execute(
                "INSERT INTO users (full_name, email, password_hash) VALUES (%s, %s, %s)",
                ("CareerWeave Examples", dummy_email, hashed_pwd)
            )
            dummy_user_id = cursor.lastrowid
            
        # 3. Clear existing examples to prevent duplicates
        print("Clearing existing example roadmaps to prevent duplicates...")
        cursor.execute("DELETE FROM roadmaps WHERE is_example = 1 AND user_id = %s", (dummy_user_id,))
        
        # 4. Insert Roadmaps
        for r in roadmaps:
            roadmap_query = """
                INSERT INTO roadmaps
                (user_id, target_name, target_degree, career_goal, domain, current_skill_level,
                 skill_gap_summary, total_weeks, is_feasible, is_example, feasibility_reasoning,
                 last_accessed_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            """
            roadmap_values = (
                dummy_user_id,
                r.get("target_name"),
                r.get("target_degree"),
                r.get("career_goal"),
                r.get("domain"),
                r.get("current_skill_level"),
                r.get("skill_gap_summary"),
                r.get("total_weeks"),
                r.get("is_feasible", 1),
                1, # is_example
                r.get("feasibility_reasoning"),
            )
            cursor.execute(roadmap_query, roadmap_values)
            roadmap_id = cursor.lastrowid
            
            # 5. Insert Milestones
            milestone_query = """
                INSERT INTO milestones
                (roadmap_id, week_number, topic, key_objective, task, difficulty,
                 estimated_hours, resources)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            for m in r.get("milestones", []):
                # Ensure resources are inserted as JSON string
                resources_val = m.get("resources", [])
                if not isinstance(resources_val, str):
                    resources_val = json.dumps(resources_val)
                    
                node_values = (
                    roadmap_id,
                    m.get("week_number"),
                    m.get("topic"),
                    m.get("key_objective"),
                    m.get("task"),
                    m.get("difficulty"),
                    m.get("estimated_hours"),
                    resources_val,
                )
                cursor.execute(milestone_query, node_values)
                
        conn.commit()
        print(f"Successfully seeded {len(roadmaps)} example roadmaps into the database!")

    except mysql.connector.Error as err:
        print(f"SQL Error during seeding: {err}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    seed_database()
