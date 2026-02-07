from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship, JSON
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    assessments: List["Assessment"] = Relationship(back_populates="user")

class Assessment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # 1. The Raw Input (Text Blobs)
    raw_distress: str
    raw_functioning: str
    raw_urgency: str
    raw_safety: str
    raw_constraints: str
    latitude: float
    longitude: float

    # 2. The LLM Calculated Scores
    issue_type: str
    urgency: str
    severity_score: int
    needs_immediate_resources: bool
    confidence: float
    
    # 3. The Full Output (Stored as JSON for flexibility)
    full_plan_json: str = Field(sa_type=JSON) 

    user: Optional[User] = Relationship(back_populates="assessments")