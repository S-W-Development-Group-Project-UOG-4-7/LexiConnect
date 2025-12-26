from sqlalchemy.orm import Session
from app.models import Lawyer, User
from app.modules.lawyers.schemas import LawyerProfileUpdate
from typing import List, Optional
import os
from datetime import datetime

def get_lawyers(db: Session, name: Optional[str] = None, specialization: Optional[str] = None, location: Optional[str] = None) -> List[dict]:
    query = db.query(Lawyer, User).join(User, Lawyer.user_id == User.id)
    if name:
        query = query.filter(User.full_name.ilike(f"%{name}%"))
    if specialization:
        query = query.filter(Lawyer.specialization.ilike(f"%{specialization}%"))
    if location:
        query = query.filter(Lawyer.location.ilike(f"%{location}%"))
    results = query.all()
    return [
        {
            "id": lawyer.id,
            "name": user.full_name,
            "specialization": lawyer.specialization,
            "experience_years": lawyer.experience_years,
            "profile_image": lawyer.profile_image,
        }
        for lawyer, user in results
    ]

def get_lawyer_profile(db: Session, lawyer_id: int) -> Optional[dict]:
    result = db.query(Lawyer, User).join(User, Lawyer.user_id == User.id).filter(Lawyer.id == lawyer_id).first()
    if not result:
        return None
    lawyer, user = result
    return {
        "id": lawyer.id,
        "full_name": user.full_name,
        "specialization": lawyer.specialization,
        "experience_years": lawyer.experience_years,
        "bio": lawyer.bio,
        "location": lawyer.location,
        "profile_image": lawyer.profile_image,
        "created_at": lawyer.created_at.isoformat(),
        "updated_at": lawyer.updated_at.isoformat(),
    }

def update_lawyer_profile(db: Session, user_id: int, update_data: LawyerProfileUpdate) -> bool:
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == user_id).first()
    if not lawyer:
        return False
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(lawyer, field, value)
    lawyer.updated_at = datetime.utcnow()
    db.commit()
    return True

def upload_profile_image(db: Session, user_id: int, image_path: str) -> bool:
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == user_id).first()
    if not lawyer:
        return False
    lawyer.profile_image = image_path
    lawyer.updated_at = datetime.utcnow()
    db.commit()
    return True
