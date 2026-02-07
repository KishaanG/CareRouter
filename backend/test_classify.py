"""
Simple tester for classify_user_text function.
Run with: python test_classify.py
"""
import os
import json
from pathlib import Path
from schemas import UserAssessmentInput
from classify import classify_user_text

def check_environment():
    """Check if environment is properly configured"""
    print("\n" + "=" * 60)
    print("ENVIRONMENT CHECK")
    print("=" * 60)
    
    # Check for .env file
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        print(f"✅ .env file found at: {env_path}")
    else:
        print(f"⚠️  .env file NOT found at: {env_path}")
        print("   Create it with: GEMINI_API_KEY=your-key-here")
    
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        print(f"✅ GEMINI_API_KEY is set (length: {len(api_key)})")
    else:
        print("❌ GEMINI_API_KEY is NOT set")
        print("   Add to .env file: GEMINI_API_KEY=your-key-here")
    
    try:
        from google import genai
        print("✅ google-genai package is installed")
    except ImportError:
        print("❌ google-genai package is NOT installed")
        print("   Install with: pip install google-genai")
    
    print("=" * 60 + "\n")

def test_classify_basic():
    """Test with a basic mental health concern"""
    print("=" * 60)
    print("TEST 1: Basic Mental Health Concern")
    print("=" * 60)
    
    test_input = UserAssessmentInput(
        primary_concern="I've been feeling very anxious lately",
        answer_distress="I feel overwhelmed and worried most days",
        answer_functioning="I can still go to work but it's getting harder to focus",
        answer_urgency="I'd like help soon but it's not an emergency",
        answer_safety="I am safe, no thoughts of self-harm",
        answer_constraints="I prefer online or phone support, no transportation issues",
        latitude=40.7128,
        longitude=-74.0060
    )
    
    result = classify_user_text(test_input)
    print("\nResult:")
    print(json.dumps(result, indent=2))
    
    # Validate response structure
    required_fields = ["issue_type", "urgency", "severity_score", "needs_immediate_resources", "confidence", "reasoning", "personalized_note"]
    missing = [f for f in required_fields if f not in result]
    if missing:
        print(f"\n⚠️  Missing fields: {missing}")
    else:
        print("\n✅ All required fields present")
    print()

def test_classify_crisis():
    """Test with a crisis situation"""
    print("=" * 60)
    print("TEST 2: Crisis Situation")
    print("=" * 60)
    
    test_input = UserAssessmentInput(
        primary_concern="I'm having thoughts of hurting myself",
        answer_distress="I feel hopeless and don't see a way out",
        answer_functioning="I can't get out of bed, can't work",
        answer_urgency="I need help right now",
        answer_safety="I'm not sure I'm safe, having self-harm thoughts",
        answer_constraints="I need immediate help",
        latitude=34.0522,
        longitude=-118.2437
    )
    
    result = classify_user_text(test_input)
    print("\nResult:")
    print(json.dumps(result, indent=2))
    
    # Validate response structure
    required_fields = ["issue_type", "urgency", "severity_score", "needs_immediate_resources", "confidence", "reasoning", "personalized_note"]
    missing = [f for f in required_fields if f not in result]
    if missing:
        print(f"\n⚠️  Missing fields: {missing}")
    else:
        print("\n✅ All required fields present")
    print()

def test_classify_substance():
    """Test with substance use concern"""
    print("=" * 60)
    print("TEST 3: Substance Use Concern")
    print("=" * 60)
    
    test_input = UserAssessmentInput(
        primary_concern="I think I have a drinking problem",
        answer_distress="I feel guilty and ashamed about my drinking",
        answer_functioning="My drinking is affecting my job and relationships",
        answer_urgency="I want to get help as soon as possible",
        answer_safety="I am physically safe",
        answer_constraints="Need something confidential",
        latitude=41.8781,
        longitude=-87.6298
    )
    
    result = classify_user_text(test_input)
    print("\nResult:")
    print(json.dumps(result, indent=2))
    print()

def test_classify_routine():
    """Test with routine support need"""
    print("=" * 60)
    print("TEST 4: Routine Support")
    print("=" * 60)
    
    test_input = UserAssessmentInput(
        primary_concern="Looking for general stress management support",
        answer_distress="Feeling a bit stressed with work-life balance",
        answer_functioning="Everything is manageable, just want to get ahead of things",
        answer_urgency="Not urgent, when convenient",
        answer_safety="I am safe and doing okay overall",
        answer_constraints="Flexible schedule, prefer in-person",
        latitude=37.7749,
        longitude=-122.4194
    )
    
    result = classify_user_text(test_input)
    print("\nResult:")
    print(json.dumps(result, indent=2))
    
    # Validate response structure
    required_fields = ["issue_type", "urgency", "severity_score", "needs_immediate_resources", "confidence", "reasoning", "personalized_note"]
    missing = [f for f in required_fields if f not in result]
    if missing:
        print(f"\n⚠️  Missing fields: {missing}")
    else:
        print("\n✅ All required fields present")
    print()

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("TESTING classify_user_text FUNCTION")
    print("=" * 60 + "\n")
    
    check_environment()
    
    try:
        test_classify_basic()
        test_classify_crisis()
        test_classify_substance()
        test_classify_routine()
        
        print("=" * 60)
        print("ALL TESTS COMPLETED")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
