import os
import json
from typing import Dict

# The new SDK uses 'from google import genai'
try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# ---------------------------
# Gemini Client Setup
# ---------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None

if GEMINI_AVAILABLE and GEMINI_API_KEY:
    try:
        # New SDK initialization
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Initialization Error: {e}")
        client = None

def classify_user_text(user_story: str) -> Dict:
    """
    Uses the new Google Gen AI SDK to classify mental health needs.
    """
    # If no client or key, return the safe moderate fallback immediately
    if not client:
        return {
            "severity_tier": 3,
            "urgency": 3,
            "support_type": "short-term professional",
            "error": "Gemini Client not initialized."
        }

    prompt = f"""
    Analyze this mental health check-in and provide a JSON response.
    USER INPUT: "{user_story}"
    
    1. severity_tier: 1-5
    2. urgency: 1-5
    3. support_type: [peer/community, short-term professional, crisis escalation]
    4. accessibility_filter:
       - cost: "free/low cost" or "private"
       - format: "local", "online", or "hotline"
       - language: list any or "any"
       - time_flexibility: "low", "standard", or "high"
    
    CRITICAL: If self-harm is mentioned, urgency must be 5 and support_type 'crisis escalation'.
    RETURN ONLY JSON.
    """

    try:
        # New SDK syntax: client.models.generate_content
        response = client.models.generate_content(
            model='gemini-2.5-flash', # Or your preferred version
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json' # Forces JSON output
            )
        )
        
        # In the new SDK, response.text is directly accessible
        return json.loads(response.text)

    except Exception as e:
        return {
            "severity_tier": 3,
            "urgency": 3,
            "support_type": "short-term professional",
            "error": f"AI Error: {str(e)}"
        }

def test():
    test_input = "I've been feeling really down and have had thoughts of self-harm."
    result = classify_user_text(test_input)
    print(json.dumps(result, indent=2))