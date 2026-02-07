import os
import json
from typing import Dict
from schemas import UserAssessmentInput
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

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
        print(f"✅ Gemini client initialized successfully")
    except Exception as e:
        print(f"❌ Gemini initialization error: {e}")
        client = None
else:
    if not GEMINI_AVAILABLE:
        print("❌ Google GenAI SDK not installed. Run: pip install google-genai")
    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY environment variable not set")

def classify_user_text(input: UserAssessmentInput) -> Dict:
    """
    Uses the new Google Gen AI SDK to classify mental health needs.
    """
    # If no client or key, return the safe moderate fallback immediately
    if not client:
        return {
            "issue_type": "general_support",
            "urgency": "soon",
            "severity_score": 2,
            "needs_immediate_resources": False,
            "confidence": 0.0,
            "reasoning": "System unavailable - default routing applied.",
            "personalized_note": "We're here to help. Based on your responses, we recommend connecting with a mental health professional who can provide personalized support."
        }
    
    intake_json = json.dumps(input.model_dump(), ensure_ascii=False)

    prompt = f"""
        You are a SUPPORT TRIAGE CLASSIFIER.

        Your job is NOT to diagnose or provide therapy.
        Your job is ONLY to classify support needs and urgency
        based on structured intake answers.
        Never infer substance use, gambling, or addiction unless explicitly mentioned in primary_concern or intake text.

        You must follow ALL rules strictly.

        --------------------------------
        ALLOWED ISSUE TYPES (choose ONE only):
        - mental_health
        - gambling
        - alcohol
        - drug_use
        - behavioral_addiction
        - crisis_safety
        - general_support
        - financial_stress
        - relationship_family
        - grief_loss
        - unknown

        ALLOWED URGENCY LEVELS:
        - routine
        - soon
        - urgent
        - immediate_crisis

        --------------------------------
        DECISION RULES:

        1. If answer_safety contains explicit self-harm risk:
        - issue_type = crisis_safety
        - urgency = immediate_crisis

        2. If safety_check = "I'm not sure":
        - urgency must be at least "urgent"

        3. Daily functioning matters more than emotional distress.

        4. Time sensitivity maps to urgency:
        - Not urgent → routine
        - Soon → soon
        - As soon as possible → urgent

        5. Emotional distress alone does NOT mean crisis.

        6. If information is unclear:
        - use "unknown" or "general_support"

        7. NEVER invent diagnoses or medical labels.

        --------------------------------
        SEVERITY SCORE GUIDE:
        1 = mild distress + functioning intact
        2 = moderate distress OR mild impairment
        3 = major impairment OR urgent support needed
        4 = safety concern OR cannot function

        --------------------------------
        PERSONALIZED NOTE GUIDELINES:
        Create a compassionate, warm message (2-4 sentences) that:
        - Acknowledges what the person shared
        - Validates their experience without diagnosing
        - Provides reassurance about the support available
        - Uses supportive, hopeful language
        - Reflects the urgency level appropriately
        
        Example for crisis: "Thank you for reaching out during this difficult time. Your safety is our top priority, and we've identified immediate resources that can provide support right now."
        
        Example for routine: "We appreciate you taking this step. Based on what you've shared, connecting with support resources can help you navigate these challenges at a comfortable pace."

        --------------------------------
        Return ONLY valid JSON. If you produce anything other than valid JSON, the response is invalid.
        OUTPUT FORMAT:
        
        {{
        "issue_type": "",
        "urgency": "",
        "severity_score": 1-4,
        "needs_immediate_resources": true/false,
        "confidence": 0.0-1.0,
        "reasoning": "brief non-clinical explanation",
        "personalized_note": "2-4 sentence compassionate message acknowledging their situation"
        }}

        --------------------------------
        INTAKE DATA:
        {intake_json}
    """

    try:
        # New SDK syntax: client.models.generate_content
        response = client.models.generate_content(
            model='gemini-2.5-flash',  # Stable model version
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json' # Forces JSON output
            )
        )
        
        # In the new SDK, response.text is directly accessible
        result = json.loads(response.text)
        print(f"✅ Gemini API call successful")
        return result

    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {e}")
        print(f"Raw response: {response.text if 'response' in locals() else 'No response'}")
        return {
            "issue_type": "unknown",
            "urgency": "soon",
            "severity_score": 2,
            "needs_immediate_resources": False,
            "confidence": 0.0,
            "reasoning": "JSON parsing error - default moderate routing applied.",
            "personalized_note": "Thank you for sharing with us. We're experiencing a technical issue, but we've identified resources that can provide the support you need. Please reach out to a mental health professional for personalized guidance."
        }
    except Exception as e:
        print(f"❌ Gemini API error: {type(e).__name__}: {e}")
        return {
            "issue_type": "unknown",
            "urgency": "soon",
            "severity_score": 2,
            "needs_immediate_resources": False,
            "confidence": 0.0,
            "reasoning": "Model error - default moderate routing applied.",
            "personalized_note": "Thank you for sharing with us. We're experiencing a technical issue, but we've identified resources that can provide the support you need. Please reach out to a mental health professional for personalized guidance."
        }