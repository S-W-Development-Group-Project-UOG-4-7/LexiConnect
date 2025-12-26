from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.modules.lawyers.service import get_lawyers, get_lawyer_profile, update_lawyer_profile, upload_profile_image
from app.modules.lawyers.schemas import LawyerProfileUpdate
from app.auth import get_current_user
from app.models import User
from typing import Optional
import os
import shutil

router = APIRouter(prefix="/lawyers", tags=["Lawyers"])

@router.get("/")
def search_lawyers(
    name: Optional[str] = None,
    specialization: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_lawyers(db, name, specialization, location)

@router.get("/{lawyer_id}")
def get_lawyer(lawyer_id: int, db: Session = Depends(get_db)):
    profile = get_lawyer_profile(db, lawyer_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    return profile

@router.put("/profile")
def update_profile(
    update_data: LawyerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can update their profile")
    success = update_lawyer_profile(db, current_user.id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Lawyer profile not found")
    return {"message": "Profile updated successfully"}

@router.post("/profile/image")
def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can upload profile images")
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/profile_images"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    file_path = f"{upload_dir}/{current_user.id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    success = upload_profile_image(db, current_user.id, file_path)
    if not success:
        raise HTTPException(status_code=404, detail="Lawyer profile not found")
    return {"message": "Image uploaded successfully", "image_path": file_path}
