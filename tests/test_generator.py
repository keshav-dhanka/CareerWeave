import unittest
from unittest.mock import patch, MagicMock
from backend.generator import weave_from_prompt, generate_roadmap
from backend.schemas import CareerContext, CareerRoadmap

class TestGenerator(unittest.TestCase):

    @patch('backend.generator.Client')
    @patch('backend.generator.gemini_api_key', 'fake_key')
    @patch('backend.generator.gemini_model_id', 'fake_model')
    def test_weave_from_prompt_success(self, MockClient):
        # Mock the Google AI Client
        mock_instance = MagicMock()
        MockClient.return_value.__enter__.return_value = mock_instance
        
        # Simulate a successful JSON response matching CareerContext schema
        mock_response = MagicMock()
        mock_response.text = '{"target_name": "Keshav", "target_degree": "B.Tech", "target_role": "AI Engineer", "current_skills": "Python, SQL"}'
        mock_instance.models.generate_content.return_value = mock_response

        # Call the generator logic
        result = weave_from_prompt("I am Keshav, a B.Tech student who knows Python and wants to be an AI Engineer.")

        # Verify interconnection logic
        self.assertIsNotNone(result)
        self.assertEqual(result.target_name, "Keshav")
        self.assertEqual(result.target_role, "AI Engineer")
        mock_instance.models.generate_content.assert_called_once()

    @patch('backend.generator.Client')
    @patch('backend.generator.gemini_api_key', 'fake_key')
    @patch('backend.generator.gemini_model_id', 'fake_model')
    def test_generate_roadmap_failure_retry_limit(self, MockClient):
        # Force a generic Exception to trigger retry mechanism
        mock_instance = MagicMock()
        MockClient.return_value.__enter__.return_value = mock_instance
        mock_instance.models.generate_content.side_effect = Exception("503 Server Overloaded")
        
        dummy_context = CareerContext(target_name="Keshav", target_degree="B.Tech", target_role="AI Engineer", current_skills="Python")
        
        # Will retry 3 times and then return None
        result = generate_roadmap(dummy_context)
        self.assertIsNone(result)
        self.assertEqual(mock_instance.models.generate_content.call_count, 3)

if __name__ == '__main__':
    unittest.main()
