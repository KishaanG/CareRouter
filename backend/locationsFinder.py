import requests
import json
import os
from dotenv import load_dotenv
from google import genai
from schemas import UserAssessmentInput, AssessmentScores

# Load variables from .env
load_dotenv()

# Get keys from environment (backend .env: GOOGLE_MAPS_API_KEY for Places API)
MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Check if keys are missing to avoid confusing errors later
if not MAPS_API_KEY or not GEMINI_API_KEY:
    print("⚠️ WARNING: API Keys are missing! Check your .env file.")

# For Nearby Search to return places: enable "Places API" (not just Maps JavaScript API)
# in Google Cloud Console → APIs & Services → Enable APIs.


# --- Configuration ---
MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "YOUR_GOOGLE_MAPS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)

ISSUE_SPECIFIC_RESOURCES = {
    "mental_health": [
        {"name": "ConnexOntario", "type": "Helpline", "data": "1-866-531-2600", "description": "24/7 free and confidential health services information for mental health and addiction."},
        {"name": "Wellness Together", "type": "Helpline", "data": "1-866-585-0445", "description": "24/7 mental health and substance use support. Text WELLNESS to 741741."}
    ],
    "alcohol": [
        {"name": "ConnexOntario (Alcohol)", "type": "Helpline", "data": "1-866-531-2600", "description": "Support for alcohol recovery and addiction services."},
        {"name": "NORS Overdose Response", "type": "Helpline", "data": "1-888-688-6677", "description": "Confidential, nonjudgmental overdose prevention support."}
    ],
    "drug_use": [
        {"name": "ConnexOntario (Drugs)", "type": "Helpline", "data": "1-866-531-2600", "description": "Support for drug addiction and treatment services."},
        {"name": "National Overdose Response Service", "type": "Helpline", "data": "1-888-688-6677", "description": "Immediate, nonjudgmental support for people using substances alone."}
    ],
    "gambling": [
        {"name": "ConnexOntario (Gambling)", "type": "Helpline", "data": "1-866-531-2600", "description": "Specialized support for problem gambling, available 24/7."}
    ],
    "behavioral_addiction": [
        {"name": "ConnexOntario", "type": "Helpline", "data": "1-866-531-2600", "description": "General addiction support for behavioral concerns and mental health."}
    ],
    "crisis_safety": [
        {"name": "Talk Suicide Canada", "type": "Helpline", "data": "1-833-456-4566", "description": "Toll-free support for concerns about suicide. Text 45645 (4 PM-Midnight ET)."},
        {"name": "Distress Centres Ontario", "type": "Website", "data": "dcontario.org", "description": "Find a listening ear for lonely, depressed, or suicidal individuals."}
    ],
    "relationship_family": [
        {"name": "Assaulted Women's Helpline", "type": "Helpline", "data": "1-866-863-0511", "description": "24-hour crisis line for women experiencing abuse. Mobile: #SAFE (#7233)."}
    ],
    "financial_stress": [
        {"name": "Ontario Caregiver Helpline", "type": "Helpline", "data": "1-833-416-2273", "description": "One-stop resource for caregivers needing financial and navigation support."}
    ]
}

# Single keywords for Places API (Nearby Search does not support multiple terms in one request)
TYPE_MAP = {
        "mental_health": "mental health clinic",
        "behavioral_addiction": "behavioral health",
        "gambling": "gambling support",
        "alcohol": "alcohol support",
        "drug_use": "addiction treatment",
        "crisis_safety": "crisis center",
        "general_support": "community center",
        "financial_stress": "counseling",
        "relationship_family": "family therapy",
        "grief_loss": "grief counseling",
        "loneliness": "community center",
        "unknown": "mental health"
    }

def generate_resource_list(assessment: AssessmentScores):
    """Generates the mandatory national/static safety net."""
    final_resources = []
    
    # 1. IMMEDIATE CRISIS (Severity 4 or urgency='immediate_crisis')
    if assessment.severity_score >= 4 or assessment.urgency == "immediate_crisis":
        final_resources.append({
            "name": "Emergency Services (9-1-1)",
            "type": "Helpline",
            "description": "Call 9-1-1 if you are in immediate danger.",
            "data": "9-1-1"
        })
        final_resources.append({
            "name": "9-8-8 Suicide & Crisis Lifeline",
            "type": "Helpline",
            "description": "Safe, confidential support for anyone in Canada.",
            "data": "9-8-8"
        })

    # 2. TARGETED ISSUE SUPPORT
    # Append all resources associated with the detected issue type
    targeted = ISSUE_SPECIFIC_RESOURCES.get(assessment.issue_type, [])
    for res in targeted:
        final_resources.append(res)

    # 3. AGE/DEMOGRAPHIC SPECIFIC (Based on issue_type or keywords)
    # Post-secondary students
    if assessment.issue_type in ["mental_health", "loneliness", "general_support"]:
        final_resources.append({
            "name": "Good2Talk",
            "type": "Helpline",
            "description": "Ontario's 24/7 helpline for post-secondary students.",
            "data": "1-866-925-5454"
        })

    # Youth
    if assessment.severity_score >= 2:
        final_resources.append({
            "name": "Kids Help Phone",
            "type": "Helpline",
            "description": "Professional counseling and info for youth. Text CONNECT to 686868.",
            "data": "1-800-668-6868"
        })

    # 4. LOW SEVERITY PREVENTATIVE (Severity 1 or 2)
    if assessment.severity_score <= 2:
        final_resources.append({
            "name": "BounceBack Ontario",
            "type": "Website",
            "description": "Guided CBT-based skill-building for managing low mood and stress (Ages 15+).",
            "data": "https://bouncebackontario.ca/"
        })

    return final_resources

def _places_nearby_search(lat: float, lng: float, keyword: str) -> list:
    """Single Places API Nearby Search request. Returns up to 10 results."""
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=5000&keyword={keyword}&key={MAPS_API_KEY}"
    try:
        response = requests.get(url)
        data = response.json()
        results = data.get("results", [])[:10]
        status = data.get("status", "")
        if not results:
            print(f"🗺️ Places API: status={status!r} keyword={keyword!r}")
            if status not in ("OK", "ZERO_RESULTS"):
                print(f"   error_message={data.get('error_message', 'none')}")
        return results
    except Exception as e:
        print(f"Maps API Error: {e}")
        return []


def get_nearby_resources(responses: UserAssessmentInput, assessment: AssessmentScores):
    """Fetches raw data from Google Maps Places API (Nearby Search) based on detected issue type."""

    lat, lng = responses.latitude, responses.longitude
    keyword = TYPE_MAP.get(assessment.issue_type, "mental health")
    results = _places_nearby_search(lat, lng, keyword)
    # Fallback: if no results with specific keyword, try broader terms
    if not results and assessment.issue_type in (
        "mental_health", "behavioral_addiction", "grief_loss", "relationship_family", "unknown"
    ):
        results = _places_nearby_search(lat, lng, "counseling")
    if not results:
        results = _places_nearby_search(lat, lng, "mental health")
    return results

def pick_best_resources(responses: UserAssessmentInput, assessment: AssessmentScores, raw_places: list):
    """Uses Gemini to select the 3 most appropriate local results based on user story."""
    if not raw_places:
        return []

    # Simplify data for the LLM
    places_summary = []
    for i, p in enumerate(raw_places):
        places_summary.append({
            "index": i,
            "name": p.get("name"),
            "rating": p.get("rating"),
            "address": p.get("vicinity")
        })

    # Prepare context
    data = responses.model_dump()
    data.pop("answer_constraints", None)
    user_story = json.dumps(data, ensure_ascii=False)
    user_assessment = json.dumps(assessment.model_dump(), ensure_ascii=False)

    prompt = f"""
    ### ROLE
    You are a mental health clinical coordinator.

    ### CONTEXT
    User Story: "{user_story}"
    User Assessment: "{user_assessment}"
    User Constraints: {responses.answer_constraints}

    ### AVAILABLE RESOURCES
    {json.dumps(places_summary)}

    ### TASK
    1. Analyze the User Story and Constraints.
    2. From the AVAILABLE RESOURCES, select the top 3 that best match the user's needs.
    3. If a resource violates a constraint (e.g., costs money when user needs free), skip it.
    4. For each selection, provide a brief "rationale."

    ### OUTPUT FORMAT
    Return ONLY a JSON array of objects.
    Example: [{{"index": 0, "rationale": "Description here"}}]
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )

        selections = json.loads(response.text)
        final_output = []

        for item in selections:
            idx = item.get("index")
            if 0 <= idx < len(raw_places):
                place = raw_places[idx]
                geo = place.get("geometry", {})
                loc = geo.get("location", {})
                out = {
                    "name": place.get("name"),
                    "type": "Facility",
                    "description": item.get("rationale"),
                    "data": place.get("vicinity")
                }
                if loc.get("lat") is not None and loc.get("lng") is not None:
                    out["latitude"] = loc["lat"]
                    out["longitude"] = loc["lng"]
                final_output.append(out)
        return final_output
    except Exception as e:
        print(f"Gemini Selection Error: {e}")
        return []
