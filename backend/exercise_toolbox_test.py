import json
from schemas import AssessmentScores
from exercisesToolbox import generate_coping_toolbox  # Assuming your code is in coping_tool.py

def test_toolbox_generation():
    print("--- 🧘 Starting Coping Toolbox AI Test ---")

    # 1. Create a mock assessment for an anxious/overwhelmed user
    mock_assessment = AssessmentScores(
        issue_type="mental_health",
        urgency="soon",
        severity_score=3,
        needs_immediate_resources=False,
        confidence=0.95,
        reasoning="User is experiencing high academic stress and signs of a panic attack.",
        personalized_note="I can see you're carrying a lot right now with school."
    )

    print(f"🔍 Testing toolbox for: {mock_assessment.issue_type} (Severity: {mock_assessment.severity_score})")

    # 2. Call the generation function
    toolbox = generate_coping_toolbox(mock_assessment)

    # 3. Validate and Print Results
    if not toolbox:
        print("❌ FAILED: Toolbox returned empty. Check your API key or Model Name.")
        return

    print(f"✅ SUCCESS: Received {len(toolbox)} exercises from Gemini.\n")

    for i, exercise in enumerate(toolbox, 1):
        print(f"--- Exercise {i}: {exercise.get('title')} ---")
        print(f"Benefit: {exercise.get('benefit')}")
        print("Steps:")
        for step in exercise.get('steps', []):
            print(f"  • {step}")
        print("\n")

if __name__ == "__main__":
    test_toolbox_generation()