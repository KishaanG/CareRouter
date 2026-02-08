from pydantic import BaseModel
from typing import List, Optional

# --- INPUT: What the frontend sends ---
class UserAssessmentInput(BaseModel):
    # The 5 open-ended text answers
    primary_concern: str
    answer_distress: str       # "I've been feeling overwhelmed..."
    answer_functioning: str    # "I can't get out of bed..."
    answer_urgency: str        # "I need help right now..."
    answer_safety: str         # "I am safe but scared..."
    answer_constraints: str    # "I don't have a car..."

    latitude: Optional[float] = None
    longitude: Optional[float] = None

# --- INTERMEDIATE: The LLM's First Output (The Scores) ---
class AssessmentScores(BaseModel):
    issue_type: str
    urgency: str
    severity_score: int
    needs_immediate_resources: bool
    confidence: float
    reasoning: str
    personalized_note: str

# --- OUTPUT: The Final Plan (The Recommendation) ---
class FinalPlan(BaseModel):
    scores: AssessmentScores
    recommended_pathway: List[dict] # [{"name": "Crisis Line", "type": "Phone", "desc": "...", "data": "..."}, ]

# --- AUTH: Register Payload ---
class RegisterRequest(BaseModel):
    email: str
    password: str