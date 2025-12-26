from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.kyc_submission import KYCSubmission
from app.modules.kyc.schemas import KYCSubmitRequest, KYCResponse
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.lawyer import Lawyer


router = APIRouter(prefix="/api/kyc", tags=["KYC"])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=KYCResponse)
    @router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=KYCResponse
    )
    
def submit_kyc(
    payload: KYCSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can submit KYC")

    # 🔑 Find lawyer record linked to this user
    lawyer = (
        db.query(Lawyer)
        .filter(Lawyer.email == current_user.email)
        .first()
    )

    if not lawyer:
        raise HTTPException(
            status_code=400,
            detail="Lawyer profile not found for this user"
        )

    # Check if KYC already exists
    existing = (
        db.query(KYCSubmission)
        .filter(KYCSubmission.lawyer_id == lawyer.id)
        .first()
    )

    if existing:
        raise HTTPException(status_code=409, detail="KYC already submitted")

    kyc = KYCSubmission(
        lawyer_id=lawyer.id,
        full_name=payload.full_name,
        nic_number=payload.nic_number,
        bar_council_id=payload.bar_council_id,
        address=payload.address,
        contact_number=payload.contact_number,
        bar_certificate_url=payload.bar_certificate_url,
        status="pending",
    )

    db.add(kyc)
    db.commit()
    db.refresh(kyc)

    return {"message": "KYC submitted successfully"}



@router.get("/me", response_model=KYCResponse)
def get_my_kyc(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    
):
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can view KYC")

    lawyer = (
        db.query(Lawyer)
        .filter(Lawyer.email == current_user.email)
        .first()
    )

    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer profile not found")

    kyc = (
        db.query(KYCSubmission)
        .filter(KYCSubmission.lawyer_id == lawyer.id)
        .first()
    )

    if not kyc:
        raise HTTPException(status_code=404, detail="KYC not submitted")

    return kyc
