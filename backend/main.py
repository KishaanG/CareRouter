from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from exercisesToolbox import generate_exercise_toolbox
from sqlmodel import Session, select, create_engine, SQLModel
from models import User, Assessment, UserProfile
from schemas import UserAssessmentInput, FinalPlan, AssessmentScores, RegisterRequest
from classify import classify_user_text
from locationsFinder import get_nearby_resources, pick_best_resources
from auth import get_password_hash, create_access_token, verify_password, get_current_user
from fastapi.security import OAuth2PasswordRequestForm
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database Setup (SQLite for demo)
engine = create_engine("sqlite:///database.db")
SQLModel.metadata.create_all(engine)

app = FastAPI()

# CORS Configuration - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

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

@app.post("/api/register")
def register(request: RegisterRequest):
    with Session(engine) as session:
        existing_user = session.exec(select(User).where(User.email == request.email)).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email taken")

        new_user = User(
            email=request.email,
            hashed_password=get_password_hash(request.password)
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        access_token = create_access_token(data={"sub": new_user.email})
        return {"access_token": access_token, "token_type": "bearer"}

# --- PROTECTED ROUTE EXAMPLE ---
# Only accessible if the request has a valid Bearer token
@app.get("/api/me/assessments")
def read_my_assessments(current_user: User = Depends(get_current_user)):
    """
    Returns all past assessments for the currently logged-in user.
    """
    with Session(engine) as session:
        assessments = session.exec(
            select(Assessment)
            .where(Assessment.user_id == current_user.id)
            .order_by(Assessment.created_at.desc())
        ).all()

    return {
        "email": current_user.email,
        "history": assessments
    }

@app.get("/api/me/profile")
def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns user's additional profile information (birthdate, university, phone number).
    """
    with Session(engine) as session:
        profile = session.exec(
            select(UserProfile).where(UserProfile.user_id == current_user.id)
        ).first()
        
        if not profile:
            return {
                "birthdate": None,
                "university": None,
                "phone_number": None
            }
        
        return {
            "birthdate": profile.birthdate,
            "university": profile.university,
            "phone_number": profile.phone_number
        }

@app.put("/api/me/profile")
def update_user_profile(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Updates user's additional profile information.
    """
    with Session(engine) as session:
        profile = session.exec(
            select(UserProfile).where(UserProfile.user_id == current_user.id)
        ).first()
        
        if not profile:
            # Create new profile
            profile = UserProfile(
                user_id=current_user.id,
                birthdate=data.get("birthdate"),
                university=data.get("university"),
                phone_number=data.get("phoneNumber")
            )
            session.add(profile)
        else:
            # Update existing profile
            profile.birthdate = data.get("birthdate")
            profile.university = data.get("university")
            profile.phone_number = data.get("phoneNumber")
        
        session.add(profile)
        session.commit()
        session.refresh(profile)
        
        return {
            "status": "success",
            "birthdate": profile.birthdate,
            "university": profile.university,
            "phone_number": profile.phone_number
        }

# --- STEP A: The "Magic" Endpoint (Login Required) ---
@app.post("/api/generate-plan", response_model=FinalPlan)
async def generate_plan(
    data: UserAssessmentInput,
    current_user: User = Depends(get_current_user),
):
    # Step 1: Get classification scores from Gemini (includes personalized_note)
    scores_dict = classify_user_text(data)
    scores = AssessmentScores(**scores_dict)
    
    # Get user's profile information (university, etc.)
    user_profile = None
    with Session(engine) as session:
        profile = session.exec(
            select(UserProfile).where(UserProfile.user_id == current_user.id)
        ).first()
        if profile:
            user_profile = {
                "university": profile.university,
                "phone_number": profile.phone_number,
                "birthdate": profile.birthdate
            }
    
    # Step 2: Generate static resource list (helplines, crisis lines, etc.)
    from locationsFinder import generate_resource_list
    static_resources = generate_resource_list(scores)
    print(f"📞 Static resources count: {len(static_resources)}")
    
    # Step 3: Get nearby resources from Google Maps (if location available)
    raw_places = []
    if data.latitude and data.longitude:
        print(f"📍 Location provided: {data.latitude}, {data.longitude}")
        raw_places = get_nearby_resources(data, scores, user_profile)
        print(f"🗺️ Google Maps returned {len(raw_places)} places")
    else:
        print(f"⚠️ No location provided - skipping Google Maps search")
    
    # Step 4: Use LLM to pick the best local resources based on user needs
    local_resources = []
    if raw_places:
        local_resources = pick_best_resources(data, scores, raw_places, user_profile)
        print(f"🤖 Gemini selected {len(local_resources)} local resources")
    else:
        print(f"⚠️ No raw places to filter - skipping Gemini selection")
    
    # Step 5: Combine static + local resources
    pathway = static_resources + local_resources
    
    # Debug: Print what we're sending
    print(f"\n{'='*60}")
    print(f"📤 SENDING TO FRONTEND:")
    print(f"{'='*60}")
    print(f"Issue Type: {scores.issue_type}")
    print(f"Severity: {scores.severity_score}/4")
    print(f"Urgency: {scores.urgency}")
    print(f"Static resources: {len(static_resources)}")
    print(f"Local resources: {len(local_resources)}")
    print(f"Total Resources: {len(pathway)}")
    for i, res in enumerate(pathway[:5], 1):
        print(f"  {i}. {res.get('name')} ({res.get('type')}) - {res.get('data')}")
    if len(pathway) > 5:
        print(f"  ... and {len(pathway) - 5} more")
    print(f"{'='*60}\n")

    exercises = generate_exercise_toolbox(scores)
    print(f"🧘 Generated {len(exercises)} exercises")
    
    # Return complete plan (personalized_note is in scores)
    plan = FinalPlan(
        scores=scores,
        recommended_pathway=pathway,
        exercises=exercises
    )

    with Session(engine) as session:
        new_assessment = Assessment(
            user_id=current_user.id,

            # The Raw Text - Matches UserAssessmentInput
            raw_primary_concern=data.primary_concern,
            raw_distress=data.answer_distress,
            raw_functioning=data.answer_functioning,
            raw_urgency=data.answer_urgency,
            raw_safety=data.answer_safety,
            raw_constraints=data.answer_constraints,
            latitude=data.latitude,
            longitude=data.longitude,

            # The Calculated Scores - Matches AssessmentScores
            issue_type=scores.issue_type,
            urgency=scores.urgency,
            severity_score=scores.severity_score,
            needs_immediate_resources=scores.needs_immediate_resources,
            confidence=scores.confidence,
            reasoning=scores.reasoning,
            personalized_note=scores.personalized_note,

            # The Full Recommendation
            full_plan_json=plan.dict()
        )
        session.add(new_assessment)
        session.commit()

    return plan

