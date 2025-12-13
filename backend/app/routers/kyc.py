from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.kyc_submission import KYCSubmission as KYCModel
from ..schemas.kyc import KYCSubmissionCreate, KYCSubmission

router = APIRouter(prefix="/kyc", tags=["KYC"])

fake_lawyer_id = 1  # Temporary until authentication is added

@router.post("/", response_model=KYCSubmission)
def submit_kyc(data: KYCSubmissionCreate, db: Session = Depends(get_db)):
    # Check if KYC already exists
    existing = db.query(KYCModel).filter(KYCModel.lawyer_id == fake_lawyer_id).first()

    if existing:
        # Update existing KYC
        existing.full_name = data.full_name
        existing.nic_number = data.nic_number
        existing.bar_council_id = data.bar_council_id
        existing.address = data.address
        existing.contact_number = data.contact_number
        existing.bar_certificate_url = data.bar_certificate_url
        existing.status = "pending"

        db.commit()
        db.refresh(existing)
        return existing

    # Create new KYC
    new_kyc = KYCModel(
        lawyer_id=fake_lawyer_id,
        full_name=data.full_name,
        nic_number=data.nic_number,
        bar_council_id=data.bar_council_id,
        address=data.address,
        contact_number=data.contact_number,
        bar_certificate_url=data.bar_certificate_url,
        status="pending"
    )

    db.add(new_kyc)
    db.commit()
    db.refresh(new_kyc)

    return new_kyc


@router.get("/my")
def get_my_kyc(db: Session = Depends(get_db)):
    kyc = db.query(KYCModel).filter(KYCModel.lawyer_id == fake_lawyer_id).first()

    if not kyc:
        # Instead of raising an HTTPException (which breaks response_model),
        # return a clean JSON status
        return {
            "status": "none",
            "message": "KYC Not Submitted"
        }

    return kyc
