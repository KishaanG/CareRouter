import requests
import json
from google import genai
from schemas import UserAssessmentInput, AssessmentScores

# Setup your keys
MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"
client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

def get_nearby_resources(responses: UserAssessmentInput, assessment: AssessmentScores):
    """Fetches raw data from Google Maps."""
    # Map your support_types to Google Maps 'types' or keywords
    type_map = {
        "mental_health": "psychotherapist | mental health clinic | counseling center",
        "behavioral_addiction": "behavioral health center | addiction treatment center",
        
        "gambling": "gambling addiction support | Gamblers Anonymous",
        "alcohol": "alcohol recovery | Alcoholics Anonymous | addiction treatment",
        "drug_use": "drug addiction treatment | detox center | rehab center",
        
        "crisis_safety": "hospital emergency room | crisis intervention center | 24 hour clinic",
        
        "general_support": "community center | social services | non-profit organization",
        "financial_stress": "credit counseling | debt relief service | food bank | legal aid",
        "relationship_family": "marriage counselor | family counselor | relationship therapy",
        "grief_loss": "grief counseling | bereavement support | hospice care",
        
        "loneliness": "volunteer center | social club | community center",
        
        "unknown": "community health center"
    }

    ISSUE_SPECIFIC_RESOURCES = {
        "mental_health": {
            "name": "Wellness Together Canada",
            "desc": "Free mental health and substance use support portal.",
            "type": "Website",
            "data": "https://wellnesstogether.ca/"
        },
        "addiction": {
            "name": "ConnexOntario",
            "desc": "24/7 support for addiction, gambling, and mental health.",
            "data": "https://www.connexontario.ca/"
        },
        "financial_stress": {
            "name": "Credit Counselling Canada",
            "desc": "Non-profit debt help and financial education.",
            "data": "https://creditcounsellingcanada.ca/"
        },
        "relationship_family": {
            "name": "Family Service Canada",
            "desc": "Community-based family and relationship counseling.",
            "data": "https://familyservicecanada.org/"
        },
        "grief_loss": {
            "name": "MyGrief.ca",
            "desc": "Online support for those dealing with loss and grief.",
            "data": "https://mygrief.ca/"
        }
    }
    
    keyword = type_map.get(assessment.issue_type, "mental health")
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={responses.latitude},{responses.longitude}&radius=5000&keyword={keyword}&key={MAPS_API_KEY}"
    
    response = requests.get(url)
    return response.json().get('results', [])[:10]
'''
def generate_resource_list(assessment: AssessmentScores):
    final_resources = []
    
    # --- PHASE 1: IMMEDIATE SAFETY (MANDATORY) ---
    if assessment.needs_immediate_resources or assessment.urgency == "immediate_crisis":
        final_resources.append({
            "name": "Emergency Services (9-1-1)",
            "type": "Immediate Support",
            "priority": "Critical",
            "data": "9-1-1"
        })
        final_resources.append({
            "name": "9-8-8 Suicide & Crisis Lifeline",
            "type": "24/7 Phone/Text",
            "priority": "Critical",
            "data": "9-8-8"
        })

    # --- PHASE 2: SPECIALIZED ISSUE SUPPORT ---
    # We look up the specific issue type provided by the model
    issue_data = ISSUE_SPECIFIC_RESOURCES.get(assessment.issue_type)
    if issue_data:
        final_resources.append({
            "name": issue_data["name"],
            "type": "Specialized Support",
            "Description": issue_data["desc"],
            "data": issue_data["url"]
        })

    # --- PHASE 3: SEVERITY-BASED ADDITIONS ---
    # Low Severity / Preventive
    if assessment.severity_score <= 2:
        final_resources.append({
            "name": "BounceBack Ontario",
            "type": "Guided Self-Help",
            "Description": "CBT-based skill-building for managing stress and low mood.",
            "data": "https://bouncebackontario.ca/"
        })
    
    # High Urgency but not Crisis
    elif assessment.urgency in ["urgent", "soon"]:
        final_resources.append({
            "name": "Talk Suicide Helpline",
            "type": "Phone",
            "Description": "National support for those in distress or concerned about someone else.",
            "data": "1-833-456-4566"
        })

    return final_resources

        if (assessment.severity_score == 0):
        prompt += " The user is in a low severity state and can benefit from general support resources that promote wellbeing."
        list.append({
            "name": "Wellness Together Canada",
            "type": "Online",
            "Description": "Offers mental health and substance use support, including self-assessment tools, resources, and connections to trained volunteers and professionals.",
            "data": "https://wellnesstogether.ca/en-ca/"})

    if (assessment.urgency == "routine"):
        prompt += " The user is in a routine state and can benefit from resources that support ongoing wellbeing."
        list.append({
            "name": "BounceBack",
            "type": "Website",
            "Description": "A free, guided self-help program that's effective in helping people aged 15 and up who are experiencing mild-to-moderate anxiety or depression, or may be feeling low, stressed, worried, irritable or angry.",
            "data": "https://bouncebackontario.ca/"})

    if (assessment.urgency == "urgent" or assessment.urgency == "soon" or assessment.urgency == "immediate_crisis"):
        prompt += " The user needs support soon, so prioritize resources that are responsive and have good ratings."
        list.append({
            "name": "Talk Suicide Helpline",
            "type": "Phone",
            "Description": "Offers toll-free support to people in Canada who have concerns about suicide. Phone line available 24/7 or text 45645 between 4 p.m. and midnight ET.",
            "data": "1-833-456-4566"})
        list.append({
            "name": "Kids Help Phone",
            "type": "Phone",
            "Description": "Youth mental health support available 24/7.",
            "data": "1-800-668-6868"})
        if (assessment.urgency == "immediate_crisis" or assessment.issue_type == "crisis_safety"):
            prompt += " The user is in immediate crisis and needs urgent support."
            list.append({
                "name": "Emergency Services",
                "type": "Phone",
                "Description": "Immideate emergency assistance.",
                "data": "9-8-8"})
            list.append({
                "name": "Emergency Services",
                "type": "Phone",
                "Description": "Immideate emergency assistance.",
                "data": "9-1-1"})
        else:
            prompt += " The user is not in immediate crisis but still needs support soon."

'''
def pick_best_resources(responses: UserAssessmentInput, assessment: AssessmentScores, raw_places: list):
    
    # Simplify the data so we don't waste tokens
    places_summary = []
    for p in raw_places:
        places_summary.append({
            "name": p.get("name"),
            "rating": p.get("rating"),
            "address": p.get("vicinity"),
            "types": p.get("types")
        })

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
    Return ONLY a JSON array of objects. Example:
    [
    {"index": 0, "rationale": "Selected because it offers free youth counseling which matches the user's age and financial constraint."},
    {"index": 2, "rationale": "..."},
    {"index": 3, "rationale": "..."}
    ]
    """

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
            
            formatted_resource = {
                "name": place.get("name"),
                "type": "Local Facility",
                "description": item.get("rationale"),
                "data": place.get("vicinity")
            }
            final_output.append(formatted_resource)

    return final_output