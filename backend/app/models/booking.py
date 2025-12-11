from fastapi import APIRouter
from app.models.kyc import KYCSubmission
from app.database import SessionLocal

router = APIRouter(prefix="/admin/kyc", tags=["kyc"])

@router.get("/pending")
def get_pending_kyc():
    db = SessionLocal()
    submissions = db.query(KYCSubmission).filter(KYCSubmission.status=="pending").all()
    db.close()
    return submissions

@router.post("/approve")
def approve_kyc(submission_id: int):
    db = SessionLocal()
    kyc = db.query(KYCSubmission).get(submission_id)
    if not kyc:
        db.close()
        return {"success": False, "message": "Submission not found"}
    kyc.status = "approved"
    db.commit()
    db.close()
    return {"success": True}

@router.post("/reject")
def reject_kyc(submission_id: int):
    db = SessionLocal()
    kyc = db.query(KYCSubmission).get(submission_id)
    if not kyc:
        db.close()
        return {"success": False, "message": "Submission not found"}
    kyc.status = "rejected"
    db.commit()
    db.close()
    return {"success": True}
