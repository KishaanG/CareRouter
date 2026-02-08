import os
import json
from dotenv import load_dotenv
from google import genai
from schemas import AssessmentScores

# Load variables from .env
load_dotenv()

# Get keys from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Check if keys are missing to avoid confusing errors later
if not GEMINI_API_KEY:
    print("⚠️ WARNING: API Keys are missing! Check your .env file.")


# --- Configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)

def generate_exercise_toolbox(assessment: AssessmentScores):
    """Generates 3 immediate, evidence-based coping exercises based on the user's issue."""
    
    prompt = f"""
    ### ROLE
    You are a clinical psychologist specializing in immediate crisis stabilization and grounding techniques.

    ### CONTEXT
    The user is currently experiencing: {assessment.issue_type}
    Severity Level: {assessment.severity_score}/4
    Clinical Reasoning: {assessment.reasoning}

    ### TASK
    Provide 3 specific, actionable coping exercises the user can do RIGHT NOW.
    - If severity is high (4), focus on grounding and safety.
    - If severity is low (1-2), focus on skill-building or reflection.
    - Exercises must be brief (under 5 minutes).

    ### OUTPUT FORMAT
    Return ONLY a JSON array of objects:
    [
      {{
        "title": "Exercise Name",
        "steps": ["Step 1...", "Step 2..."],
        "benefit": "Why this helps for this specific issue"
      }}
    ]
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Coping Toolbox Error: {e}")
        return []