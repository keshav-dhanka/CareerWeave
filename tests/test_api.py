import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app
from backend.security import get_current_user

class TestAPI(unittest.TestCase):
    
    def setUp(self):
        self.client = TestClient(app)
        # Setup override for protected endpoints so we don't need real JWTs during testing
        self.client.app.dependency_overrides[get_current_user] = lambda: {"id": 10, "full_name": "Test User", "email": "test@example.com"}

    def tearDown(self):
        self.client.app.dependency_overrides = {}

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "Online", "message": "Career Weave API is ready."})

    @patch('backend.main.db.create_user')
    def test_signup_auto_login(self, mock_create):
        # Database successfully creates user and returns ID 10
        mock_create.return_value = 10
        
        payload = {
            "full_name": "Test User",
            "email": "test@example.com",
            "password": "securepassword123"
        }
        response = self.client.post("/signup", json=payload)
        
        self.assertEqual(response.status_code, 200)
        # Proves Auto-login returns a JWT token immediately
        self.assertIn("access_token", response.json())
        mock_create.assert_called_once()

    @patch('backend.main.db.get_all_user_roadmaps')
    def test_protected_history_endpoint(self, mock_get_roadmaps):
        # Database returns fake roadmaps
        mock_get_roadmaps.return_value = [{"id": 1, "career_goal": "AI Engineer"}]
        
        # We don't provide a Bearer token in headers, but it works because of the override we set up in setUp!
        response = self.client.get("/history")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        # Proves it grabbed the injected dependency ID correctly
        mock_get_roadmaps.assert_called_once_with(10)

    @patch('backend.main.generator.weave_from_prompt')
    @patch('backend.main.generator.generate_roadmap')
    @patch('backend.main.db.save_complete_roadmap')
    def test_generate_interconnection(self, mock_save, mock_gen, mock_weave):
        """Tests the full flow from API to Generator to DB without real AI hits."""
        # 1. Mock context extraction
        from backend.schemas import CareerContext, CareerRoadmap
        mock_weave.return_value = CareerContext(
            target_name="Explorer", # Testing the fallback logic!
            target_degree="Self Taught",
            target_role="Frontend Dev",
            current_skills="HTML"
        )
        
        # 2. Mock roadmap generation
        mock_gen.return_value = CareerRoadmap(
            target_name="Test User",
            target_degree="Self Taught",
            career_goal="Frontend Dev",
            is_feasible=True,
            feasibility_reasoning="Very doable.",
            current_skill_level="Beginner",
            skill_gap_summary="Needs CSS.",
            total_weeks=4,
            curriculum=[]
        )
        
        # 3. Mock DB save
        mock_save.return_value = True

        payload = {"user_id": 10, "user_prompt": "I want to be a frontend dev."}
        response = self.client.post("/generate", json=payload)
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        mock_weave.assert_called_once()
        mock_gen.assert_called_once()
        mock_save.assert_called_once()
        
        # Most importantly, verify the endpoint successfully intercepted "Explorer" and gave the AI the true DB name!
        called_context = mock_gen.call_args[0][0]
        self.assertEqual(called_context.target_name, "Test User")

if __name__ == '__main__':
    unittest.main()
