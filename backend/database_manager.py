import mysql.connector
import os
from dotenv import load_dotenv
import bcrypt

load_dotenv()


def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)


def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Database Connection Error: {err}")
        return None


def get_user_by_email(email: str):
    conn = get_db_connection()
    if not conn: return None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def create_user(full_name, email, raw_password):
    password_hash = hash_password(raw_password)

    conn = get_db_connection()
    if not conn: return False

    try:
        cursor = conn.cursor()
        query = "INSERT INTO users (full_name, email, password_hash) VALUES (%s, %s, %s)"
        cursor.execute(query, (full_name, email, password_hash))
        conn.commit()
        return True
    
    except Exception as e:
        print(f"Signup Error: {e}")
        return False
    
    finally:
        cursor.close()
        conn.close()


def save_complete_roadmap(user_id, roadmap_data):
    conn = get_db_connection()
    if not conn: return False

    try:
        cursor = conn.cursor()
        roadmap_query = """
            INSERT INTO roadmaps 
            (user_id, career_goal, current_skill_level, skill_gap_summary, total_weeks, is_feasible, feasibility_reasoning)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        roadmap_values = (
            user_id, 
            roadmap_data.career_goal, 
            roadmap_data.current_skill_level, 
            roadmap_data.skill_gap_summary, 
            roadmap_data.total_weeks, 
            roadmap_data.is_feasible, 
            roadmap_data.feasibility_reasoning
        )
        cursor.execute(roadmap_query, roadmap_values)
        roadmap_id = cursor.lastrowid

        if roadmap_data.is_feasible and roadmap_data.curriculum:
            milestone_query = """
                INSERT INTO milestones 
                (roadmap_id, week_number, topic, key_objective, task, difficulty, estimated_hours, resource_type, suggested_resource)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            # This is the "Unpacking" logic you asked about
            for node in roadmap_data.curriculum:
                node_values = (
                    roadmap_id,
                    node.week_number,
                    node.topic,
                    node.key_objective,
                    node.task,
                    node.difficulty,
                    node.estimated_hours,
                    node.resource_type,
                    node.suggested_resource
                )
                cursor.execute(milestone_query, node_values)

        conn.commit()
        print(f"Success: Roadmap #{roadmap_id} saved with {len(roadmap_data.curriculum)} milestones.")
        return True

    except mysql.connector.Error as err:
        print(f"SQL Error: {err}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def get_roadmap_by_id(roadmap_id):
    conn = get_db_connection()
    if not conn: return False

    try:
        cursor = conn.cursor(dictionary=True)
        
        # Get Parent
        cursor.execute("SELECT * FROM roadmaps WHERE id = %s", (roadmap_id,))
        roadmap = cursor.fetchone()
        
        if roadmap:
            # Get Children
            cursor.execute("SELECT * FROM milestones WHERE roadmap_id = %s ORDER BY week_number", (roadmap_id,))
            roadmap['milestones'] = cursor.fetchall()
            
        return roadmap
    finally:
        cursor.close()
        conn.close()