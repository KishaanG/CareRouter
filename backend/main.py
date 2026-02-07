from fastapi import FastAPI, HTTPException, Depends, status
from sqlmodel import Session, select, create_engine, SQLModel
from models import User, Assessment
from schemas import UserAssessmentInput, SaveProfileRequest, FinalPlan, AssessmentScores
from classify import classify_user_text
from auth import get_password_hash, create_access_token, verify_password, get_current_user
from fastapi.security import OAuth2PasswordRequestForm

# Database Setup (SQLite for demo)
engine = create_engine("sqlite:///database.db")
SQLModel.metadata.create_all(engine)

app = FastAPI()

def generate_pathway_recommendations(scores: AssessmentScores, data: UserAssessmentInput):
    """Generate care pathway based on classification scores."""
    pathway = []
    
    # Crisis resources for immediate needs
    if scores.needs_immediate_resources or scores.urgency == "immediate_crisis":
        pathway.append({
            "name": "Crisis Text Line",
            "type": "Text",
            "contact": "Text HOME to 741741",
            "availability": "24/7",
            "description": "Free, confidential crisis support via text message."
        })
        pathway.append({
            "name": "988 Suicide & Crisis Lifeline",
            "type": "Phone",
            "contact": "988",
            "availability": "24/7",
            "description": "Immediate phone support for people in crisis."
        })
    
    # Issue-specific resources
    if scores.issue_type == "gambling":
        pathway.append({
            "name": "National Problem Gambling Helpline",
            "type": "Phone",
            "contact": "1-800-522-4700",
            "availability": "24/7",
            "description": "Confidential help for gambling problems."
        })
    elif scores.issue_type in ["alcohol", "drug_use"]:
        pathway.append({
            "name": "SAMHSA National Helpline",
            "type": "Phone",
            "contact": "1-800-662-4357",
            "availability": "24/7",
            "description": "Treatment referral and information service."
        })
    
    # Professional support for moderate to high severity
    if scores.severity_score >= 2:
        pathway.append({
            "name": "Psychology Today Therapist Finder",
            "type": "Online",
            "contact": "www.psychologytoday.com",
            "description": "Find licensed therapists in your area."
        })
    
    # General mental health resources
    if scores.issue_type == "mental_health" or scores.issue_type == "general_support":
        pathway.append({
            "name": "NAMI HelpLine",
            "type": "Phone/Text",
            "contact": "1-800-950-6264 or text NAMI to 741741",
            "availability": "M-F 10am-10pm ET",
            "description": "Mental health information and resources."
        })
    
    return pathway

def generate_personalized_note(scores: AssessmentScores, data: UserAssessmentInput):
    """Create a personalized note based on assessment."""
    urgency_messages = {
        "immediate_crisis": "We're concerned about your immediate safety and have prioritized crisis resources.",
        "urgent": "Your situation requires prompt attention. We've found resources that can help soon.",
        "soon": "Based on your needs, we recommend connecting with support within the next week.",
        "routine": "We've identified resources that can support your ongoing wellbeing."
    }
    
    base_message = urgency_messages.get(scores.urgency, "We've identified resources to support you.")
    
    if scores.confidence < 0.7:
        base_message += " If these don't feel like the right fit, please reach out to a mental health professional for personalized guidance."
    
    return base_message

@app.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with Session(engine) as session:
        # 1. Find User
        user = session.exec(select(User).where(User.email == form_data.username)).first()
        
        # 2. Validate Password
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # 3. Generate Token
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}

# --- PROTECTED ROUTE EXAMPLE ---
# Only accessible if the request has a valid Bearer token
@app.get("/api/me/assessments")
def read_my_assessments(current_user: User = Depends(get_current_user)):
    """
    Returns all past assessments for the currently logged-in user.
    """
    # Because of the Relationship in models.py, we can just access .assessments
    return {
        "email": current_user.email,
        "history": current_user.assessments
    }

# --- STEP A: The "Magic" Endpoint (No Login) ---
@app.post("/api/generate-plan", response_model=FinalPlan)
async def generate_plan(data: UserAssessmentInput):
    # Step 1: Get classification scores from Gemini
    scores_dict = classify_user_text(data)
    scores = AssessmentScores(**scores_dict)
    
    # Step 2: Generate pathway recommendations based on scores
    pathway = generate_pathway_recommendations(scores, data)
    
    # Step 3: Create personalized note
    note = generate_personalized_note(scores, data)
    
    # Return complete plan
    return FinalPlan(
        scores=scores,
        recommended_pathway=pathway,
        personalized_note=note,
        latitude=data.latitude or 0.0,
        longitude=data.longitude or 0.0
    )

# --- STEP B: The "Save" Endpoint (Login) ---
@app.post("/api/register-and-save")
async def register_and_save(request: SaveProfileRequest):
    with Session(engine) as session:
        # 1. User Check
        existing_user = session.exec(select(User).where(User.email == request.email)).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email taken")

        # 2. Create User
        new_user = User(
            email=request.email, 
            hashed_password=get_password_hash(request.password)
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        # 3. Store the Evidence
        new_assessment = Assessment(
            user_id=new_user.id,
            
            # The Raw Text
            raw_distress=request.original_input.answer_distress,
            raw_functioning=request.original_input.answer_functioning,
            raw_urgency=request.original_input.answer_urgency,
            raw_safety=request.original_input.answer_safety,
            raw_constraints=request.original_input.answer_constraints,
            latitude=request.original_input.latitude or 0.0,
            longitude=request.original_input.longitude or 0.0,

            # The Calculated Scores (extracted from the plan)
            issue_type=request.generated_plan.scores.issue_type,
            urgency=request.generated_plan.scores.urgency,
            severity_score=request.generated_plan.scores.severity_score,
            needs_immediate_resources=request.generated_plan.scores.needs_immediate_resources,
            confidence=request.generated_plan.scores.confidence,

            # The Full Recommendation
            full_plan_json=request.generated_plan.json()
        )
        session.add(new_assessment)
        session.commit()

        # 4. Return Token
        return {
            "access_token": create_access_token({"sub": new_user.email}),
            "message": "Plan saved securely."
        }