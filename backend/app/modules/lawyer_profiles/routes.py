from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import get_current_user
from app.models.user import UserRole
from .schemas import LawyerProfileOut, LawyerProfileUpdate
from .service import search_profiles, get_profile, upsert_profile_for_user

router = APIRouter(prefix="/api/lawyer-profiles", tags=["Lawyer Profiles"])


def _is_lawyer(user) -> bool:
    role = getattr(user, "role", None)
    if isinstance(role, UserRole):
        return role == UserRole.lawyer
    return str(role).lower() == "lawyer"


@router.get("/search", response_model=List[LawyerProfileOut])
def search_lawyer_profiles(
    q: Optional[str] = Query(None, description="Free text search"),
    district: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    specialization: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return search_profiles(db, q=q, district=district, city=city, specialization=specialization, language=language)


@router.get("/{user_id}", response_model=LawyerProfileOut)
def get_lawyer_profile(user_id: int, db: Session = Depends(get_db)):
    profile = get_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch(
    "/me",
    response_model=LawyerProfileOut,
    status_code=status.HTTP_200_OK,
)
def update_my_profile(
    payload: LawyerProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not _is_lawyer(current_user):
        raise HTTPException(status_code=403, detail="Only lawyers can update profile")

    profile = upsert_profile_for_user(db, current_user)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
