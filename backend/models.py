from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship, Column
from sqlalchemy import JSON
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    assessments: List["Assessment"] = Relationship(back_populates="user")

class Assessment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # 1. The Raw Input (Text Blobs) - Matches UserAssessmentInput
    raw_primary_concern: str
    raw_distress: str
    raw_functioning: str
    raw_urgency: str
    raw_safety: str
    raw_constraints: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # 2. The LLM Calculated Scores - Matches AssessmentScores
    issue_type: str
    urgency: str
    severity_score: int
    needs_immediate_resources: bool
    confidence: float
    reasoning: str
    personalized_note: str
    
    # 3. The Full Output (Stored as JSON for flexibility)
    full_plan_json: dict = Field(default={}, sa_column=Column(JSON)) 

    user: Optional[User] = Relationship(back_populates="assessments")