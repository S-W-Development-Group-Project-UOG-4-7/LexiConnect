from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.kyc_submission import KYCSubmission
from app.modules.kyc.schemas import KYCSubmitRequest, KYCResponse
from app.routers.auth import get_current_user
from app.models.user import User, UserRole
from app.models.lawyer import Lawyer
from app.modules.audit_log.service import log_event


router = APIRouter(prefix="/api/kyc", tags=["KYC"])
admin_router = APIRouter(prefix="/api/admin/kyc", tags=["Admin KYC"])


@router.post("", status_code=status.HTTP_201_CREATED)
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
        raise HTTPException(status_code=400, detail="KYC already submitted")

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


# --------------------------------------------------------------------------
# Admin endpoints
# --------------------------------------------------------------------------
def _require_admin(user: User):
    role = getattr(user, "role", None)
    if isinstance(role, UserRole):
        is_admin = role == UserRole.admin
    else:
        is_admin = str(role).lower() == "admin"
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin only")


@admin_router.get("", response_model=list[KYCResponse])
def list_kyc_submissions(
    status: str = "pending",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)

    query = db.query(KYCSubmission)
    if status and status.lower() != "all":
        query = query.filter(KYCSubmission.status == status.lower())

    return query.order_by(KYCSubmission.submitted_at.desc()).all()


def _get_submission_or_404(db: Session, submission_id: int) -> KYCSubmission:
    submission = db.query(KYCSubmission).filter(KYCSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="KYC submission not found")
    return submission


@admin_router.patch("/{submission_id}/approve", response_model=KYCResponse)
def approve_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)
    submission = _get_submission_or_404(db, submission_id)
    submission.status = "approved"
    db.commit()
    db.refresh(submission)
    log_event(
        db,
        user=current_user,
        action="KYC_APPROVED",
        description=f"KYC submission {submission.id} approved",
        meta={"submission_id": submission.id, "lawyer_id": submission.lawyer_id},
    )
    return submission


@admin_router.patch("/{submission_id}/reject", response_model=KYCResponse)
def reject_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)
    submission = _get_submission_or_404(db, submission_id)
    submission.status = "rejected"
    db.commit()
    db.refresh(submission)
    log_event(
        db,
        user=current_user,
        action="KYC_REJECTED",
        description=f"KYC submission {submission.id} rejected",
        meta={"submission_id": submission.id, "lawyer_id": submission.lawyer_id},
    )
    return submission
