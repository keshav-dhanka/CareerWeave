import unittest
from unittest.mock import patch, MagicMock
from backend.database_manager import (
    create_user,
    get_all_user_roadmaps,
    delete_roadmap,
    delete_user
)
# pyrefly: ignore [missing-import]
import mysql.connector

class TestDatabaseManager(unittest.TestCase):

    @patch('backend.database_manager.get_db_connection')
    @patch('backend.database_manager.hash_password')
    def test_create_user_integrity_error(self, mock_hash, mock_get_db):
        """Test that an IntegrityError (like duplicate email) returns None without crashing."""
        mock_hash.return_value = "hashed_pass"
        
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        
        # Simulate Integrity Error on execute
        mock_cursor.execute.side_effect = mysql.connector.errors.IntegrityError("Duplicate email")
        mock_get_db.return_value = mock_conn

        result = create_user("Test User", "test@example.com", "password123")
        
        self.assertIsNone(result)
        mock_conn.commit.assert_not_called()

    @patch('backend.database_manager.get_db_connection')
    def test_get_all_user_roadmaps(self, mock_get_db):
        """Test retrieving all roadmaps for a given user."""
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        
        mock_cursor.fetchall.return_value = [{"id": 1, "topic": "Python"}, {"id": 2, "topic": "React"}]
        mock_get_db.return_value = mock_conn

        roadmaps = get_all_user_roadmaps(10)
        
        self.assertEqual(len(roadmaps), 2)
        mock_cursor.execute.assert_called_once()
        self.assertIn("FROM roadmaps", mock_cursor.execute.call_args[0][0])
        
    @patch('backend.database_manager.get_db_connection')
    def test_delete_user(self, mock_get_db):
        """Test user deletion cascade support wrapper."""
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        
        mock_cursor.rowcount = 1
        mock_get_db.return_value = mock_conn

        success = delete_user(5)
        
        self.assertTrue(success)
        mock_cursor.execute.assert_called_with("DELETE FROM users WHERE id = %s", (5,))
        mock_conn.commit.assert_called_once()
        


if __name__ == "__main__":
    unittest.main()
