from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.modules.lawyer_profiles.models import LawyerProfile

router = APIRouter(prefix="/lawyers", tags=["Lawyers"])


@router.get("/")
def list_lawyers(
    district: Optional[str] = None,
    city: Optional[str] = None,
    specialization: Optional[str] = None,
    language: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List lawyers from profiles joined with users, with optional filters."""
    query = (
        db.query(User, LawyerProfile)
        .join(LawyerProfile, LawyerProfile.user_id == User.id)
        .filter(User.role == UserRole.lawyer)
    )

    filters = []
    if district:
        filters.append(LawyerProfile.district.ilike(f"%{district}%"))
    if city:
        filters.append(LawyerProfile.city.ilike(f"%{city}%"))
    if specialization:
        filters.append(LawyerProfile.specialization.ilike(f"%{specialization}%"))
    if language:
        filters.append(LawyerProfile.languages.contains([language]))
    if q:
        filters.append(User.full_name.ilike(f"%{q}%"))

    if filters:
        query = query.filter(and_(*filters))

    results = []
    for user, profile in query.all():
        results.append(
            {
                "id": user.id,
                "full_name": user.full_name,
                "specialization": profile.specialization,
                "district": profile.district,
                "city": profile.city,
                "languages": profile.languages,
                "rating": profile.rating,
            }
        )
    return results


@router.get("/{lawyer_id}")
def get_lawyer_profile(lawyer_id: int, db: Session = Depends(get_db)):
    """Return DB-backed profile data for a lawyer."""
    user_profile = (
        db.query(User, LawyerProfile)
        .join(LawyerProfile, LawyerProfile.user_id == User.id)
        .filter(User.id == lawyer_id, User.role == UserRole.lawyer)
        .first()
    )

    if not user_profile:
        raise HTTPException(status_code=404, detail="Lawyer not found")

    user, profile = user_profile

    return {
        "id": user.id,
        "full_name": user.full_name,
        "specialization": profile.specialization,
        "district": profile.district,
        "city": profile.city,
        "languages": profile.languages,
        "years_of_experience": profile.years_of_experience,
        "is_verified": profile.is_verified,
        "bio": profile.bio,
        "rating": profile.rating,
        "branches": [],
        "reviews": [],
    }
