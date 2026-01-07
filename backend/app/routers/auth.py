from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.lawyer import Lawyer
from app.modules.lawyer_profiles.models import LawyerProfile
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

# Simple in-file JWT settings for now
SECRET_KEY = "CHANGE_ME_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", scheme_name="BearerAuth")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    # TEMP DEBUG: Check if Authorization header was received
    print(f"[DEBUG get_current_user] Token received: {token is not None}")
    print(f"[DEBUG get_current_user] Token is empty: {not token if token else True}")
    print(f"[DEBUG get_current_user] Token length: {len(token) if token else 0}")
    print(f"[DEBUG get_current_user] Token value (first 20 chars): {token[:20] if token and len(token) > 20 else token}")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = get_password_hash(user_in.password)
    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=hashed_password,
        role=UserRole(user_in.role) if user_in.role else UserRole.client,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If lawyer, ensure Lawyer and LawyerProfile records exist (idempotent)
    is_lawyer = str(user.role).lower() == "lawyer"
    if is_lawyer:
        try:
            lawyer_row = db.query(Lawyer).filter(Lawyer.email == user.email).first()
            if not lawyer_row:
                lawyer_row = Lawyer(name=user.full_name, email=user.email)
                db.add(lawyer_row)
                db.commit()
                db.refresh(lawyer_row)

            profile_row = db.query(LawyerProfile).filter(LawyerProfile.user_id == user.id).first()
            if not profile_row:
                profile_row = LawyerProfile(
                    user_id=user.id,
                    district="Colombo",
                    city="Colombo",
                    specialization="General",
                    languages=["Sinhala", "English"],
                    years_of_experience=5,
                    bio="New lawyer profile",
                    rating=0.0,
                    is_verified=False,
                )
                db.add(profile_row)
                db.commit()
                db.refresh(profile_row)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed creating lawyer records: {e}")

    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses 'username' field, but we use email
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=access_token, token_type="bearer")


# ============================================================================
# TEMPORARY DEV ENDPOINT - DELETE BEFORE PRODUCTION
# ============================================================================
@router.post("/dev/create-admin")
def create_admin_user(db: Session = Depends(get_db)):
    """
    TEMPORARY: Creates a default admin user for testing.
    DELETE THIS ENDPOINT BEFORE PRODUCTION DEPLOYMENT.
    """
    admin_email = "admin@lexiconnect.com"
    
    # Check if admin already exists
    existing = get_user_by_email(db, admin_email)
    if existing:
        print(f"[DEV] Admin user {admin_email} already exists. Skipping creation.")
        return {"message": "Admin user already exists", "email": admin_email}
    
    # Create admin user
    hashed_password = get_password_hash("admin123")
    admin_user = User(
        email=admin_email,
        full_name="System Admin",
        hashed_password=hashed_password,
        role=UserRole.admin,
        phone=None,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    print(f"[DEV] ✓ Admin user created successfully!")
    print(f"[DEV]   Email: {admin_email}")
    print(f"[DEV]   Password: admin123")
    print(f"[DEV]   Role: admin")
    print(f"[DEV]   ID: {admin_user.id}")
    
    return {
        "message": "Admin user created successfully",
        "email": admin_email,
        "password": "admin123",
        "role": "admin",
    }
