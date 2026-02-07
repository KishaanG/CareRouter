from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from database import engine
from models import User 

# --- CONFIGURATION ---
# In production, get these from os.environ!
SECRET_KEY = "super_secret_demo_key_change_this_immediately"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Setup hashing engine (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Setup the token extractor
# This tells FastAPI that the token will be in the "Authorization: Bearer <token>" header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

# --- UTILITY FUNCTIONS ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if the plain password matches the hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a password so we never store plain text."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a JWT token signed with our secret key."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- THE DEPENDENCY (The Guard) ---

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Decodes the token, extracts the email, and fetches the user from the DB.
    Use this dependency on any route that requires login.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # 2. Fetch User from DB
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if user is None:
            raise credentials_exception
            
    return user