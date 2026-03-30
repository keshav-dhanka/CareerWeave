import os
from google.genai import Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
gemini_api_key = os.getenv('GEMINI_API_KEY', 'API_KEY_NOT_FOUND')

# Test the Gemini API connection and response
try:
    with Client(api_key = gemini_api_key) as client:
        response_1 = client.models.generate_content(
        model = "gemini-2.5-flash-lite", 
        contents = "Hello! I am building CareerWeave. Are you ready?")
        print("\n--- AI RESPONSE 1 ---\n")
        print(response_1.text)
        response_2 = client.models.generate_content(
        model = "gemini-2.5-flash-lite", 
        contents = "CareerWeave is an AI-driven interactive skill roadmap generator that helps students navigate their career paths effectively. It provides personalized guidance, resources, and mentorship to empower students in making informed decisions about their future.")
        print("\n--- AI RESPONSE 2 ---\n")
        print(response_2.text)
    
# Handle any exceptions that occur during the API call
except Exception as e:
    print(f"FAILED : {e}")

print("\n-------------------\n")