import os
from typing import Any, Optional

import json
# pyrefly: ignore [missing-import]
import bcrypt
# pyrefly: ignore [missing-import]
import mysql.connector
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

# Database connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Database Connection Error: {err}")
        return None

# Password hashing and verification
def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode("utf-8")
    hash_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hash_bytes)


# User management
def get_user_by_email(email: str):
    conn = get_db_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

def get_user_by_id(id: int):
    conn = get_db_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE id = %s", (id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

def update_user_last_visit(user_id: int) -> bool:
    """Records app-wide 'last visit' for Welcome Back / history."""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET last_visit_at = CURRENT_TIMESTAMP WHERE id = %s",
            (user_id,),
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Update last_visit Error: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def create_user(full_name, email, raw_password):
    hashed_password = hash_password(raw_password)

    conn = get_db_connection()
    if not conn:
        return None

    try:
        cursor = conn.cursor()
        query = "INSERT INTO users (full_name, email, password_hash) VALUES (%s, %s, %s)"
        cursor.execute(query, (full_name, email, hashed_password))
        conn.commit()
        return cursor.lastrowid

    except mysql.connector.errors.IntegrityError as e:
        print(f"Signup Error (Integrity): {e}")
        # Could be duplicate email
        return None
    except Exception as e:
        print(f"Signup Error: {e}")
        return None
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def update_user_profile(user_id: int, full_name: str, email: str) -> bool:
    conn = get_db_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET full_name = %s, email = %s WHERE id = %s",
            (full_name, email, user_id)
        )
        conn.commit()
        return True
    except mysql.connector.errors.IntegrityError as e:
        print(f"Profile Update Error (Integrity): {e}")
        return False
    except Exception as e:
        print(f"Profile Update Error: {e}")
        return False
    finally:
        if 'cursor' in locals() and cursor: cursor.close()
        if conn: conn.close()

def update_user_password(user_id: int, raw_password: str) -> bool:
    hashed_password = hash_password(raw_password)
    conn = get_db_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET password_hash = %s WHERE id = %s",
            (hashed_password, user_id)
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Password Update Error: {e}")
        return False
    finally:
        if 'cursor' in locals() and cursor: cursor.close()
        if conn: conn.close()

def delete_user(user_id: int) -> bool:
    """Deletes a user account. Thanks to ON DELETE CASCADE on 'roadmaps', this also clears their roadmaps and milestones."""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"delete_user Error: {e}")
        conn.rollback()
        return False
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Roadmap management
def save_complete_roadmap(user_id, roadmap_data):
    conn = get_db_connection()
    if not conn:
        return False

    try:
        conn.autocommit = False
        cursor = conn.cursor()

        roadmap_query = """
            INSERT INTO roadmaps
            (user_id, target_name, target_degree, career_goal, domain, current_skill_level,
             skill_gap_summary, total_weeks, is_feasible, feasibility_reasoning,
             last_accessed_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        """
        roadmap_values = (
            user_id,
            roadmap_data.target_name,
            roadmap_data.target_degree,
            roadmap_data.career_goal,
            roadmap_data.domain,
            roadmap_data.current_skill_level,
            roadmap_data.skill_gap_summary,
            roadmap_data.total_weeks,
            roadmap_data.is_feasible,
            roadmap_data.feasibility_reasoning,
        )
        cursor.execute(roadmap_query, roadmap_values)
        roadmap_id = cursor.lastrowid

        if roadmap_data.is_feasible and roadmap_data.curriculum:
            milestone_query = """
                INSERT INTO milestones
                (roadmap_id, week_number, topic, key_objective, task, difficulty,
                 estimated_hours, resources)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """

            for node in roadmap_data.curriculum:
                resources_json = json.dumps([res.model_dump() for res in node.resources])
                node_values = (
                    roadmap_id,
                    node.week_number,
                    node.topic,
                    node.key_objective,
                    node.task,
                    node.difficulty,
                    node.estimated_hours,
                    resources_json,
                )
                cursor.execute(milestone_query, node_values)

        conn.commit()
        milestone_count = len(roadmap_data.curriculum or [])
        print(f"Success: Roadmap #{roadmap_id} saved with {milestone_count} milestones.")
        return roadmap_id

    except mysql.connector.Error as err:
        print(f"SQL Error: {err}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

def get_roadmap_by_id(roadmap_id: int, user_id: Optional[int] = None):
    conn = get_db_connection()
    if not conn:
        return None

    try:
        cursor = conn.cursor(dictionary=True)
        
        if user_id is not None:
            cursor.execute("SELECT * FROM roadmaps WHERE id = %s AND user_id = %s", (roadmap_id, user_id))
        else:
            cursor.execute("SELECT * FROM roadmaps WHERE id = %s", (roadmap_id,))
            
        roadmap = cursor.fetchone()

        if roadmap:
            roadmap["is_example"] = bool(roadmap.get("is_example"))
            roadmap["domain"] = roadmap.get("domain")
            cursor.execute(
                "SELECT * FROM milestones WHERE roadmap_id = %s ORDER BY week_number ASC",
                (roadmap_id,),
            )
            raw_ms = cursor.fetchall()
            for m in raw_ms:
                if isinstance(m.get("resources"), str):
                    try:
                        m["resources"] = json.loads(m["resources"])
                    except Exception:
                        m["resources"] = []
            roadmap["milestones"] = raw_ms

        return roadmap
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def get_all_user_roadmaps(user_id: int) -> list[dict]:
    """Retrieve all roadmaps generated by a specific user with completion progress."""
    conn = get_db_connection()
    if not conn:
        return []
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                r.*,
                COUNT(CASE WHEN m.is_completed = 1 THEN 1 END) AS completed_weeks
            FROM roadmaps r
            LEFT JOIN milestones m ON r.id = m.roadmap_id
            WHERE r.user_id = %s
            GROUP BY r.id
            ORDER BY r.is_pinned DESC, r.last_accessed_at DESC
            """,
            (user_id,)
        )
        rows = cursor.fetchall()
        # Serialize datetime objects to ISO strings
        for row in rows:
            if row.get("last_accessed_at"):
                row["last_accessed_at"] = row["last_accessed_at"].isoformat()
            if row.get("created_at"):
                row["created_at"] = row["created_at"].isoformat()
            row["is_example"] = bool(row.get("is_example"))
            row["domain"] = row.get("domain")
        return rows
    except Exception as e:
        print(f"Error fetching all user roadmaps: {e}")
        return []
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def get_roadmap_history_summary(user_id: int) -> list[dict]:
    """
    Lightweight summary for dashboard Recent Weaves cards.
    Returns id, career_goal, total_weeks, last_accessed_at, skill_gap_summary,
    target_degree, current_skill_level, and completed_weeks count.
    """
    conn = get_db_connection()
    if not conn:
        return []
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                r.id,
                r.career_goal,
                r.current_skill_level,
                r.target_degree,
                r.skill_gap_summary,
                r.total_weeks,
                r.last_accessed_at,
                r.is_feasible,
                r.is_example,
                r.domain,
                r.feasibility_reasoning,
                COUNT(CASE WHEN m.is_completed = 1 THEN 1 END) AS completed_weeks
            FROM roadmaps r
            LEFT JOIN milestones m ON r.id = m.roadmap_id
            WHERE r.user_id = %s
            GROUP BY r.id, r.career_goal, r.current_skill_level, r.target_degree, r.skill_gap_summary, r.total_weeks, r.last_accessed_at, r.is_feasible, r.is_example, r.domain, r.feasibility_reasoning
            ORDER BY r.last_accessed_at DESC
            LIMIT 5
            """,
            (user_id,),
        )
        rows = cursor.fetchall()
        # Serialize datetime objects to ISO strings for JSON response
        for row in rows:
            if row.get("last_accessed_at"):
                row["last_accessed_at"] = row["last_accessed_at"].isoformat()
            row["is_example"] = bool(row.get("is_example"))
            row["domain"] = row.get("domain")
        return rows
    except Exception as e:
        print(f"get_roadmap_history_summary Error: {e}")
        return []
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def delete_roadmap(roadmap_id: int, user_id: int) -> bool:
    """Deletes a specific roadmap and its cascading dependencies for the given owner."""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM roadmaps WHERE id = %s AND user_id = %s",
            (roadmap_id, user_id)
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"delete_roadmap Error: {e}")
        conn.rollback()
        return False
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def update_roadmap_pin(roadmap_id: int, user_id: int, is_pinned: bool) -> bool:
    """Updates the pinned status of a roadmap."""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE roadmaps SET is_pinned = %s WHERE id = %s AND user_id = %s",
            (is_pinned, roadmap_id, user_id)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"update_roadmap_pin Error: {e}")
        conn.rollback()
        return False
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def rename_roadmap(roadmap_id: int, user_id: int, new_name: str) -> bool:
    """Updates the career_goal of a roadmap."""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE roadmaps SET career_goal = %s WHERE id = %s AND user_id = %s",
            (new_name, roadmap_id, user_id)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"rename_roadmap Error: {e}")
        conn.rollback()
        return False
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# Roadmap activity
def touch_roadmap_activity(roadmap_id: int, user_id: int) -> bool:
    """Marks the roadmap as recently viewed (mentor 'history')."""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE roadmaps
            SET last_accessed_at = CURRENT_TIMESTAMP
            WHERE id = %s AND user_id = %s
            """,
            (roadmap_id, user_id),
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"touch_roadmap_activity Error: {e}")
        return False
    finally:
        cursor.close()
        conn.close()


# Progress Management
def milestones_with_progress_locks(milestones: list[dict]) -> list[dict]:
    """
    Sequential unlock: week 1 always available; week N locked until week N-1 is completed.
    """
    if not milestones:
        return []

    by_week: dict[int, dict] = {}
    for row in milestones:
        wn = int(row["week_number"])
        by_week[wn] = dict(row)

    max_week = max(by_week.keys())
    out: list[dict] = []
    for week in range(1, max_week + 1):
        row = by_week.get(week)
        if not row:
            continue
        prev_done = True
        if week > 1:
            prev = by_week.get(week - 1)
            prev_done = bool(prev and prev.get("is_completed"))
        is_locked = week > 1 and not prev_done
        row = dict(row)
        row["is_locked"] = bool(is_locked)

        # Business rule: show only heading + brief for locked weeks
        if row["is_locked"]:
            allowed = {
                "id",
                "roadmap_id",
                "week_number",
                "topic",
                "key_objective",  # brief
                "task",           # allow truncated task
                "difficulty",
                "estimated_hours",
                "is_completed",
                "is_locked",
            }
            row = {k: v for k, v in row.items() if k in allowed}
            
            # Truncate key_objective to 100 chars for locked weeks
            if row.get("key_objective") and isinstance(row["key_objective"], str) and len(row["key_objective"]) > 100:
                row["key_objective"] = row["key_objective"][:100] + "..."
                
            # Truncate task to 15 words for locked weeks
            if row.get("task") and isinstance(row["task"], str):
                words = row["task"].split()
                if len(words) > 15:
                    row["task"] = " ".join(words[:15]) + "..."

        out.append(row)
    return out

def get_roadmap_with_progress(user_id: int, roadmap_id: int) -> Optional[dict[str, Any]]:
    """
    Full roadmap + milestones with computed is_locked for each week.
    Returns None if roadmap missing or not owned by user.
    """
    conn = get_db_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM roadmaps WHERE id = %s AND user_id = %s",
            (roadmap_id, user_id),
        )
        roadmap = cursor.fetchone()
        if not roadmap:
            return None

        cursor.execute(
            """
            SELECT * FROM milestones
            WHERE roadmap_id = %s
            ORDER BY week_number ASC
            """,
            (roadmap_id,),
        )
        raw = cursor.fetchall()
        for m in raw:
            if isinstance(m.get("resources"), str):
                try:
                    m["resources"] = json.loads(m["resources"])
                except Exception:
                    m["resources"] = []
        milestones = milestones_with_progress_locks(raw)
        roadmap = dict(roadmap)
        roadmap["is_example"] = bool(roadmap.get("is_example"))
        roadmap["domain"] = roadmap.get("domain")
        roadmap["milestones"] = milestones
        return roadmap
    finally:
        cursor.close()
        conn.close()

def update_milestone_progress(user_id: int, milestone_id: int, is_completed: bool) -> bool:
    """
    Marks a week completed/incomplete; only if milestone belongs to user's roadmap.
    Updates roadmap last_accessed_at for mentor history.
    """
    conn = get_db_connection()
    if not conn:
        return False
    try:
        conn.autocommit = False
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE milestones m
            INNER JOIN roadmaps r ON m.roadmap_id = r.id
            SET m.is_completed = %s,
                r.last_accessed_at = CURRENT_TIMESTAMP
            WHERE m.id = %s AND r.user_id = %s
            """,
            (is_completed, milestone_id, user_id),
        )
        ok = cursor.rowcount > 0
        conn.commit()
        return ok
    except Exception as e:
        print(f"update_milestone_progress Error: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

def cleanup_expired_unfeasible_roadmaps(user_id: int) -> int:
    """
    Deletes roadmaps where is_feasible=0 and last_accessed_at (creation time for unfeasible) 
    is older than 72 hours for a specific user.
    Returns the count of deleted roadmaps.
    """
    conn = get_db_connection()
    if not conn:
        return 0
    try:
        cursor = conn.cursor()
        # Find and delete unfeasible roadmaps older than 72 hours
        cursor.execute(
            """
            DELETE FROM roadmaps 
            WHERE user_id = %s 
              AND is_feasible = 0 
              AND created_at < DATE_SUB(NOW(), INTERVAL 72 HOUR)
            """,
            (user_id,)
        )
        deleted_count = cursor.rowcount
        conn.commit()
        if deleted_count > 0:
            print(f"Cleanup: Deleted {deleted_count} expired unfeasible roadmaps for user {user_id}")
        return deleted_count
    except Exception as e:
        print(f"cleanup_expired_unfeasible_roadmaps Error: {e}")
        return 0
    finally:
        cursor.close()
        conn.close()

def get_example_roadmaps() -> list[dict]:
    """Retrieve all public/example roadmaps where is_example = 1 with their milestones."""
    conn = get_db_connection()
    if not conn:
        return []
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM roadmaps WHERE is_example = 1 ORDER BY id DESC")
        roadmaps = cursor.fetchall()

        for r in roadmaps:
            r["is_example"] = bool(r.get("is_example"))
            r["domain"] = r.get("domain")
            if r.get("last_accessed_at"):
                r["last_accessed_at"] = r["last_accessed_at"].isoformat()
            if r.get("created_at"):
                r["created_at"] = r["created_at"].isoformat()

            cursor.execute(
                "SELECT * FROM milestones WHERE roadmap_id = %s ORDER BY week_number ASC",
                (r["id"],),
            )
            raw_ms = cursor.fetchall()
            for m in raw_ms:
                if isinstance(m.get("resources"), str):
                    try:
                        m["resources"] = json.loads(m["resources"])
                    except Exception:
                        m["resources"] = []
            """ r["milestones"] = milestones_with_progress_locks(raw_ms) """

        return roadmaps
    except Exception as e:
        print(f"get_example_roadmaps Error: {e}")
        return []
    finally:
        cursor.close()
        conn.close()