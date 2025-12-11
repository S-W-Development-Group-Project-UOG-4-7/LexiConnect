from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.lawyer_kyc import LawyerKYC, KYCStatus
from ..schemas.lawyer_kyc import LawyerKYCOut

router = APIRouter(prefix="/kyc", tags=["KYC"])


@router.get("/my")
def get_my_kyc_status_dummy():
    """Return a dummy KYC status for the current lawyer."""
    return {
        "status": "PENDING",
        "submitted_at": "2025-12-01T09:00:00Z",
        "message": "This is dummy KYC data. Real workflow will be implemented later.",
    }


@router.get("/pending", response_model=List[LawyerKYCOut])
def get_pending_kyc(db: Session = Depends(get_db)):
    """Fetch all LawyerKYC records where status is 'Pending'."""
    pending_kyc = db.query(LawyerKYC).filter(LawyerKYC.status == KYCStatus.PENDING).all()
    return pending_kyc


@router.post("/{lawyer_id}/approve", response_model=LawyerKYCOut)
def approve_kyc(lawyer_id: int, db: Session = Depends(get_db)):
    """Approve KYC for a specific lawyer by changing status to 'Approved'."""
    kyc_record = db.query(LawyerKYC).filter(LawyerKYC.user_id == lawyer_id).first()
    
    if not kyc_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"KYC record not found for lawyer_id {lawyer_id}",
        )
    
    kyc_record.status = KYCStatus.APPROVED
    db.commit()
    db.refresh(kyc_record)
    
    return kyc_record


@router.post("/{lawyer_id}/reject", response_model=LawyerKYCOut)
def reject_kyc(lawyer_id: int, db: Session = Depends(get_db)):
    """Reject KYC for a specific lawyer by changing status to 'Rejected'."""
    kyc_record = db.query(LawyerKYC).filter(LawyerKYC.user_id == lawyer_id).first()
    
    if not kyc_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"KYC record not found for lawyer_id {lawyer_id}",
        )
    
    kyc_record.status = KYCStatus.REJECTED
    db.commit()
    db.refresh(kyc_record)
    
    return kyc_record
