import requests
import json
import os
from dotenv import load_dotenv
from google import genai
from schemas import UserAssessmentInput, AssessmentScores

# Load variables from .env
load_dotenv()

# Get keys from environment
MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Check if keys are missing to avoid confusing errors later
if not MAPS_API_KEY or not GEMINI_API_KEY:
    print("⚠️ WARNING: API Keys are missing! Check your .env file.")


# --- Configuration ---
MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "YOUR_GOOGLE_MAPS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)

# Specialized Central Resources
ISSUE_SPECIFIC_RESOURCES = {
    "mental_health": {
        "name": "Wellness Together Canada",
        "description": "Free mental health and substance use support portal.",
        "type": "Website",
        "data": "https://wellnesstogether.ca/"
    },
    "addiction": {
        "name": "ConnexOntario",
        "description": "24/7 support for addiction, gambling, and mental health.",
        "type": "Helpline",
        "data": "https://www.connexontario.ca/"
    },
    "financial_stress": {
        "name": "Credit Counselling Canada",
        "description": "Non-profit debt help and financial education.",
        "type": "Service",
        "data": "https://creditcounsellingcanada.ca/"
    },
    "relationship_family": {
        "name": "Family Service Canada",
        "description": "Community-based family and relationship counseling.",
        "type": "Network",
        "data": "https://familyservicecanada.org/"
    },
    "grief_loss": {
        "name": "MyGrief.ca",
        "description": "Online support for those dealing with loss and grief.",
        "type": "Website",
        "data": "https://mygrief.ca/"
    }
}

def generate_resource_list(assessment: AssessmentScores):
    """Generates the mandatory national/static safety net based on severity/urgency."""
    final_resources = []
    
    # 1. Immediate Safety (Highest Priority)
    if assessment.needs_immediate_resources or assessment.urgency == "immediate_crisis":
        final_resources.append({
            "name": "Emergency Services (9-1-1)",
            "type": "Immediate Support",
            "description": "Immediate emergency assistance for life-threatening situations.",
            "data": "9-1-1"
        })
        final_resources.append({
            "name": "9-8-8 Suicide & Crisis Lifeline",
            "type": "24/7 Phone/Text",
            "description": "Support for people in Canada concerned about suicide or emotional distress.",
            "data": "9-8-8"
        })

    # 2. Issue Specific Support
    issue_data = ISSUE_SPECIFIC_RESOURCES.get(assessment.issue_type)
    if issue_data:
        final_resources.append(issue_data)

    # 3. Severity-Based Additions
    if assessment.severity_score <= 2 and assessment.urgency == "routine":
        final_resources.append({
            "name": "BounceBack Ontario",
            "type": "Website",
            "description": "A free, guided self-help program for managing mild-to-moderate anxiety or depression.",
            "data": "https://bouncebackontario.ca/"
        })
    elif assessment.urgency in ["urgent", "soon"]:
        final_resources.append({
            "name": "Talk Suicide Helpline",
            "type": "Phone",
            "description": "Toll-free 24/7 support available across Canada.",
            "data": "1-833-456-4566"
        })
    
    return final_resources

def get_nearby_resources(responses: UserAssessmentInput, assessment: AssessmentScores):
    """Fetches raw data from Google Maps based on detected issue type."""
    if MAPS_API_KEY == "YOUR_GOOGLE_MAPS_API_KEY":
        # Return dummy data for testing when API key is not set
        return [
            {
                "name": "Test Mental Health Clinic",
                "rating": 4.5,
                "vicinity": "123 Test Street, Kingston, ON"
            },
            {
                "name": "Sample Counseling Center",
                "rating": 4.0,
                "vicinity": "456 Sample Ave, Kingston, ON"
            },
            {
                "name": "Mock Therapy Services",
                "rating": 4.2,
                "vicinity": "789 Mock Blvd, Kingston, ON"
            }
        ]

    type_map = {
        "mental_health": "psychotherapist | mental health clinic | counseling center",
        "behavioral_addiction": "behavioral health center",
        "gambling": "gambling addiction support | Gamblers Anonymous",
        "alcohol": "alcohol recovery | Alcoholics Anonymous",
        "drug_use": "addiction treatment | rehab center",
        "crisis_safety": "hospital emergency room | crisis center",
        "general_support": "community center | social services",
        "financial_stress": "credit counseling | food bank",
        "relationship_family": "marriage counselor | family therapy",
        "grief_loss": "grief counseling",
        "loneliness": "volunteer center | social club",
        "unknown": "community health center"
    }

    keyword = type_map.get(assessment.issue_type, "mental health support")
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={responses.latitude},{responses.longitude}&radius=5000&keyword={keyword}&key={MAPS_API_KEY}"

    try:
        response = requests.get(url)
        return response.json().get('results', [])[:10]
    except Exception as e:
        print(f"Maps API Error: {e}")
        return []

def pick_best_resources(responses: UserAssessmentInput, assessment: AssessmentScores, raw_places: list):
    """Uses Gemini to select the 3 most appropriate local results based on user story."""
    if not raw_places:
        return []

    # If Gemini API key is not set, return dummy selections for testing
    if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
        final_output = []
        for i in range(min(3, len(raw_places))):
            place = raw_places[i]
            final_output.append({
                "name": place.get("name"),
                "type": "Local Facility",
                "description": f"Selected as a suitable {assessment.issue_type.replace('_', ' ')} resource based on user needs.",
                "data": place.get("vicinity")
            })
        return final_output

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
                final_output.append({
                    "name": place.get("name"),
                    "type": "Local Facility",
                    "description": item.get("rationale"),
                    "data": place.get("vicinity")
                })
        return final_output
    except Exception as e:
        print(f"Gemini Selection Error: {e}")
        return []
