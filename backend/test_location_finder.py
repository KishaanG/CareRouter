import json
import os
from schemas import UserAssessmentInput, AssessmentScores
from locationsFinder import get_nearby_resources, pick_best_resources, generate_resource_list


# 1. Properly defined Mock Input with ALL required fields
# This matches your Pydantic schema requirements
MOCK_DATA = {
    "primary_concern": "Extreme depression and feeling overwhelmed by school.",
    "answer_distress": "I feel like I'm at an 8/10 distress level right now.",
    "answer_functioning": "I can't get out of bed or attend my lectures.",
    "answer_urgency": "I need to talk to someone this week.",
    "answer_safety": "I have no plans to hurt myself, but I feel very hopeless.",
    "latitude": 44.226202696001714,
    "longitude": -76.49162604933836,
    "answer_constraints": "Must be within walking distance or bus-accessible. No private high-cost clinics."
}

def test_full_resource_flow():
    print("--- 🧪 Starting Resource Matching Test ---")


    # Initialize the model once using the complete dictionary
    mock_input = UserAssessmentInput(**MOCK_DATA)


    # 2. Mock the AI Assessment (The output from your Gemini analysis stage)
    mock_assessment = AssessmentScores(
        issue_type="mental_health",
        urgency="soon",
        severity_score=4,
        needs_immediate_resources=False,
        confidence=0.92,
        reasoning="User expresses significant depressive symptoms and needs professional intervention.",
        personalized_note="It sounds like you're going through a very heavy time at school."
    )


    print(f"\n📍 Location: {mock_input.latitude}, {mock_input.longitude}")
    print(f"🔍 Issue detected: {mock_assessment.issue_type}")


    # --- Step 1: National Safety Net ---
    static_resources = generate_resource_list(mock_assessment)
   
    # --- Step 2: Google Maps ---
    raw_places = get_nearby_resources(mock_input, mock_assessment)
    print(f"🛰️ Google Maps found {len(raw_places)} local results.")


    # --- Step 3: Gemini Filtering ---
    if raw_places:
        final_picks = pick_best_resources(mock_input, mock_assessment, raw_places)
    else:
        final_picks = []


    # --- Step 4: Display Results ---
    print("\n--- 🏆 FINAL CONSOLIDATED RESULTS ---")
    total_results = static_resources + final_picks
   
    for i, res in enumerate(total_results):
        print(f"\n[{i+1}] {res['name']}")
        print(f"    Type: {res.get('type')}")
        print(f"    Data: {res.get('data')}")
        # Standardized to lowercase 'description' based on our previous fix
        print(f"    Note: {res.get('description', 'No description available.')}")


if __name__ == "__main__":
    # Ensure your API keys are actually in your environment or hardcode them in locationsFinder.py for this test
    try:
        test_full_resource_flow()
    except Exception as e:
        print(f"❌ Test Failed: {e}")
