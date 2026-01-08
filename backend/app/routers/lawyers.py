from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.lawyer import Lawyer
from app.models.service_package import ServicePackage
from app.modules.lawyer_profiles.models import LawyerProfile
from app.routers.auth import get_current_user

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
                "id": user.id,  # IMPORTANT: this is users.id (used by your client routes)
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


@router.get("/by-user/{user_id}")
def get_lawyer_by_user_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Map a users.id to the corresponding lawyers.id via email."""
    if current_user.role not in {UserRole.client, UserRole.lawyer, UserRole.admin}:
        raise HTTPException(status_code=403, detail="Not authorized")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    lawyer = db.query(Lawyer).filter(Lawyer.email == user.email).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer profile not found for this user")

    return {"lawyer_id": lawyer.id, "email": user.email}


@router.get("/{lawyer_id}/service-packages")
def get_service_packages_for_lawyer(
    lawyer_id: int,
    db: Session = Depends(get_db),
):
    """Return ACTIVE service packages for a given lawyers.id."""
    packages = (
        db.query(ServicePackage)
        .filter(ServicePackage.lawyer_id == lawyer_id)
        .filter(ServicePackage.active == True)
        .order_by(ServicePackage.id.asc())
        .all()
    )

    return [
        {
            "id": p.id,
            "lawyer_id": p.lawyer_id,
            "name": p.name,
            "description": p.description,
            "price": float(p.price),
            "duration": p.duration,
            "active": p.active,
        }
        for p in packages
    ]
