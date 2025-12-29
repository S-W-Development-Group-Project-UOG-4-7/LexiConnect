from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.user import User
from .models import LawyerProfile


def search_profiles(
    db: Session,
    q: Optional[str] = None,
    district: Optional[str] = None,
    city: Optional[str] = None,
    specialization: Optional[str] = None,
    language: Optional[str] = None,
) -> List[LawyerProfile]:
    query = db.query(LawyerProfile)

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                LawyerProfile.specialization.ilike(like),
                LawyerProfile.city.ilike(like),
                LawyerProfile.district.ilike(like),
            )
        )

    if district:
        query = query.filter(LawyerProfile.district.ilike(f"%{district}%"))
    if city:
        query = query.filter(LawyerProfile.city.ilike(f"%{city}%"))
    if specialization:
        query = query.filter(LawyerProfile.specialization.ilike(f"%{specialization}%"))
    if language:
        # simple contains check; assumes JSON array of strings
        query = query.filter(LawyerProfile.languages.contains([language]))

    return query.order_by(LawyerProfile.rating.desc().nullslast()).all()


def get_profile(db: Session, user_id: int) -> Optional[LawyerProfile]:
    return db.query(LawyerProfile).filter(LawyerProfile.user_id == user_id).first()


def upsert_profile_for_user(db: Session, user: User) -> LawyerProfile:
    profile = get_profile(db, user.id)
    if profile:
        return profile

    profile = LawyerProfile(
        user_id=user.id,
        district=None,
        city=None,
        specialization=None,
        languages=[],
        years_of_experience=None,
        bio=None,
        rating=0,
        is_verified=False,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
