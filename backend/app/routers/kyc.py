from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.kyc_submission import KYCSubmission as KYCModel
from ..schemas.kyc import KYCSubmissionCreate, KYCSubmission

router = APIRouter(prefix="/kyc", tags=["KYC"])

fake_lawyer_id = 1  # Temporary placeholder until auth is implemented

@router.post("/", response_model=KYCSubmission)
def submit_kyc(data: KYCSubmissionCreate, db: Session = Depends(get_db)):
    """
    Submit or update the KYC submission for the current lawyer.
    """
    existing = db.query(KYCModel).filter(KYCModel.lawyer_id == fake_lawyer_id).first()

    if existing:
        existing.nic_number = data.nic_number
        existing.nic_front_url = data.nic_front_url
        existing.nic_back_url = data.nic_back_url
        existing.status = "pending"

        db.commit()
        db.refresh(existing)
        return existing

    new_kyc = KYCModel(
        lawyer_id=fake_lawyer_id,
        nic_number=data.nic_number,
        nic_front_url=data.nic_front_url,
        nic_back_url=data.nic_back_url,
        status="pending"
    )

    db.add(new_kyc)
    db.commit()
    db.refresh(new_kyc)

    return new_kyc


@router.get("/my", response_model=KYCSubmission)
def get_my_kyc(db: Session = Depends(get_db)):
    """
    Get the KYC submission for the current lawyer.
    """
    kyc = db.query(KYCModel).filter(KYCModel.lawyer_id == fake_lawyer_id).first()

    if not kyc:
        raise HTTPException(status_code=404, detail="KYC submission not found")

    return kyc
