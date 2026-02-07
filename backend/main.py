from fastapi import FastAPI, HTTPException, Depends, status
from sqlmodel import Session, select, create_engine, SQLModel
from models import User, Assessment
from schemas import UserAssessmentInput, SaveProfileRequest, FinalPlan, AssessmentScores
from classify import classify_user_text
from locationsFinder import get_nearby_resources, pick_best_resources
from auth import get_password_hash, create_access_token, verify_password, get_current_user
from fastapi.security import OAuth2PasswordRequestForm

# Database Setup (SQLite for demo)
engine = create_engine("sqlite:///database.db")
SQLModel.metadata.create_all(engine)

app = FastAPI()

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
    # Step 1: Get classification scores from Gemini (includes personalized_note)
    scores_dict = classify_user_text(data)
    scores = AssessmentScores(**scores_dict)
    
    # Step 2: Get nearby resources from Google Maps
    raw_places = get_nearby_resources(data, scores)
    
    # Step 3: Use LLM to pick the best resources based on user needs
    pathway = pick_best_resources(data, scores, raw_places)
    
    # Return complete plan (personalized_note is in scores)
    return FinalPlan(
        scores=scores,
        recommended_pathway=pathway
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