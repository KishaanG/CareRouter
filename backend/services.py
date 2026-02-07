import json
from schemas import UserAssessmentInput, AssessmentScores, FinalPlan

# --- PROMPT 1: The Analyzer (Text -> JSON) ---
SYSTEM_PROMPT_ANALYZER = """
You are a mental health triage assistant. 
Analyze the user's 5 text responses and output a JSON object with these exact keys:
- severity_tier (Low/Moderate/High)
- urgency (Routine/Soon/Immediate)
- support_type (Peer/Short-term Professional/Crisis)
- accessibility (List of tags: e.g., "Free", "Online", "In-person")
- reasoning (One sentence explaining the score)

Do not diagnose. Focus on functional impairment and distress.
"""

# --- PROMPT 2: The Recommender (JSON + Location -> Advice) ---
SYSTEM_PROMPT_RECOMMENDER = """
You are a local care navigator in {location}.
Based on the following triage scores: {scores_json}

Recommend 3 specific resources in {location}.
1. A "Right Now" resource (Peer support or Crisis depending on severity).
2. A "This Week" resource (Clinic or Counseling).
3. A "Safety Net" resource.

Format as a list of clear, compassionate recommendations.
"""

async def run_assessment_chain(data: UserAssessmentInput) -> FinalPlan:
    # --- STEP 1: ANALYZE ---
    # In real code: response = await llm.chat(messages=[...])
    
    # MOCK RESPONSE (Simulating what the LLM would return)
    # We parse the text answers to guess for the demo
    mock_severity = "High" if "suicide" in data.answer_safety.lower() else "Moderate"
    
    scores = AssessmentScores(
        severity_tier=mock_severity,
        urgency="Soon",
        support_type="Short-term Professional",
        accessibility=["Free", "Public Transit Accessible"],
        reasoning="User indicates moderate distress affecting work, but no immediate safety risk."
    )

    # --- STEP 2: RECOMMEND ---
    # Input: The scores we just generated + user location
    # In real code: response = await llm.chat(prompt=SYSTEM_PROMPT_RECOMMENDER...)
    
    recommended_resources = [
        {
            "tier": "Right Now",
            "name": "Wellness Together Canada",
            "details": "Free 24/7 counseling via text.",
            "match_reason": "Matches your need for 'Free' and 'Immediate' support."
        },
        {
            "tier": "This Week",
            "name": f"Community Health Centre in {data.location}",
            "details": "Walk-in counseling available Tuesdays.",
            "match_reason": "Located in your city."
        }
    ]

    return FinalPlan(
        scores=scores,
        recommended_pathway=recommended_resources,
        personalized_note="Based on what you shared, we found these resources that are free and close to you."
    )