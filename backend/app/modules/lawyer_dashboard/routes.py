from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db

# OK Change this import to your actual "current user" dependency
# examples you might already have:
# from app.core.security import get_current_user
# from app.core.auth import get_current_user
from app.routers.auth import get_current_user

# OK Change these model imports to your actual model locations
# (Search in backend/app/modules for these)
from app.models.user import User
from app.models.kyc_submission import KYCSubmission
from app.models.lawyer import Lawyer
from app.models.booking import Booking
from app.modules.queue.models import QueueEntry, QueueEntryStatus
from app.modules.cases.models import CaseRequest
from app.modules.lawyer_profiles.models import LawyerProfile
from app.modules.cases.models import Case
from app.modules.apprenticeship.models import CaseApprentice, ApprenticeCaseNote

from pydantic import BaseModel
from typing import Optional


router = APIRouter(prefix="/lawyer", tags=["Lawyer Dashboard"])


# ---------- Schemas ----------
class DashboardKpisOut(BaseModel):
    pendingRequests: int
    incomingBookings: int
    tokenQueueToday: int
    kycStatus: str


class DashboardSummaryOut(BaseModel):
    pendingRequests: int
    incomingBookings: int
    tokenQueueToday: int
    kycStatus: str


class LawyerProfileOut(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    district: Optional[str] = None
    specialization: Optional[str] = None
    experienceYears: Optional[int] = None
    languages: Optional[str] = None
    avatarUrl: Optional[str] = None
    bio: Optional[str] = None


class ApprenticeshipSummaryOut(BaseModel):
    openTasks: int
    unreadNotes: int
    latestTaskTitle: Optional[str] = None
    latestNoteSnippet: Optional[str] = None


class LawyerDashboardOut(BaseModel):
    kpis: DashboardKpisOut
    profile: LawyerProfileOut
    apprenticeship: ApprenticeshipSummaryOut


class LawyerCaseSummaryOut(BaseModel):
    id: int
    title: str
    status: str
    client_name: Optional[str] = None


# ---------- Helpers ----------
def _require_lawyer_user(user: User):
    role = (getattr(user, "role", "") or "").lower()
    if role != "lawyer":
        raise HTTPException(status_code=403, detail="Lawyer access required")


# ---------- Endpoints ----------
@router.get("/dashboard/summary", response_model=DashboardSummaryOut)
def get_lawyer_dashboard_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_lawyer_user(user)

    lawyer_id = user.id

    # 1) Pending Case Access Requests
    pending_requests = (
        db.query(func.count(CaseRequest.id))
        .filter(CaseRequest.lawyer_id == lawyer_id)
        .filter(func.lower(CaseRequest.status) == "pending")
        .scalar()
        or 0
    )

    # 2) Incoming Bookings (pending/requested)
    incoming_bookings = (
        db.query(func.count(Booking.id))
        .filter(Booking.lawyer_id == lawyer_id)
        .filter(func.lower(Booking.status).in_(["pending", "requested"]))
        .scalar()
        or 0
    )

    # 3) Token Queue Today
    today = date.today()
    token_queue_today = (
        db.query(func.count(QueueEntry.id))
        .filter(QueueEntry.lawyer_id == lawyer_id)
        .filter(QueueEntry.date == today)
        .filter(QueueEntry.status.in_([QueueEntryStatus.waiting]))
        .scalar()
        or 0
    )

    # 4) KYC Status (same source as /api/kyc/me)
    kyc_status = "not_submitted"
    lawyer = db.query(Lawyer).filter(Lawyer.email == user.email).first()
    if lawyer:
        kyc = (
            db.query(KYCSubmission)
            .filter(KYCSubmission.lawyer_id == lawyer.id)
            .order_by(KYCSubmission.submitted_at.desc())
            .first()
        )
        if kyc:
            kyc_status = (kyc.status or "not_submitted").lower()

    return DashboardSummaryOut(
        pendingRequests=pending_requests,
        incomingBookings=incoming_bookings,
        tokenQueueToday=token_queue_today,
        kycStatus=kyc_status,
    )


@router.get("/dashboard", response_model=LawyerDashboardOut)
def get_lawyer_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_lawyer_user(user)

    lawyer_id = user.id
    today = date.today()

    pending_requests = (
        db.query(func.count(CaseRequest.id))
        .filter(CaseRequest.lawyer_id == lawyer_id)
        .filter(func.lower(CaseRequest.status) == "pending")
        .scalar()
        or 0
    )

    incoming_bookings = (
        db.query(func.count(Booking.id))
        .filter(Booking.lawyer_id == lawyer_id)
        .filter(func.lower(Booking.status) == "pending")
        .scalar()
        or 0
    )

    token_queue_today = (
        db.query(func.count(QueueEntry.id))
        .filter(QueueEntry.lawyer_id == lawyer_id)
        .filter(QueueEntry.date == today)
        .scalar()
        or 0
    )
    if token_queue_today == 0:
        token_queue_today = (
            db.query(func.count(Booking.id))
            .filter(Booking.lawyer_id == lawyer_id)
            .filter(func.lower(Booking.status) == "confirmed")
            .filter(func.date(Booking.scheduled_at) == today)
            .scalar()
            or 0
        )

    kyc_status = "not_submitted"
    lawyer = db.query(Lawyer).filter(Lawyer.email == user.email).first()
    if lawyer:
        kyc = (
            db.query(KYCSubmission)
            .filter(KYCSubmission.lawyer_id == lawyer.id)
            .order_by(KYCSubmission.submitted_at.desc())
            .first()
        )
        if kyc:
            kyc_status = (kyc.status or "not_submitted").lower()

    profile = db.query(LawyerProfile).filter(LawyerProfile.user_id == lawyer_id).first()
    languages = getattr(profile, "languages", None)
    if isinstance(languages, list):
        languages = ", ".join([str(item) for item in languages if item])

    profile_out = LawyerProfileOut(
        name=getattr(user, "full_name", None) or "Lawyer",
        email=getattr(user, "email", "") or "",
        phone=getattr(user, "phone", None),
        district=getattr(profile, "district", None),
        specialization=getattr(profile, "specialization", None),
        experienceYears=getattr(profile, "years_of_experience", None),
        languages=languages,
        avatarUrl=None,
        bio=getattr(profile, "bio", None),
    )

    open_tasks = 0
    unread_notes = 0
    latest_task_title = None
    latest_note_snippet = None
    try:
        open_tasks = (
            db.query(func.count(CaseApprentice.id))
            .filter(CaseApprentice.lawyer_id == lawyer_id)
            .scalar()
            or 0
        )
        latest_task = (
            db.query(Case.title)
            .join(CaseApprentice, CaseApprentice.case_id == Case.id)
            .filter(CaseApprentice.lawyer_id == lawyer_id)
            .order_by(CaseApprentice.created_at.desc())
            .first()
        )
        latest_task_title = latest_task[0] if latest_task else None

        latest_note = (
            db.query(ApprenticeCaseNote.note)
            .join(CaseApprentice, CaseApprentice.case_id == ApprenticeCaseNote.case_id)
            .filter(CaseApprentice.lawyer_id == lawyer_id)
            .order_by(ApprenticeCaseNote.created_at.desc())
            .first()
        )
        if latest_note and latest_note[0]:
            latest_note_snippet = latest_note[0][:140]
    except Exception:
        open_tasks = 0
        unread_notes = 0
        latest_task_title = None
        latest_note_snippet = None

    apprenticeship_out = ApprenticeshipSummaryOut(
        openTasks=open_tasks,
        unreadNotes=unread_notes,
        latestTaskTitle=latest_task_title,
        latestNoteSnippet=latest_note_snippet,
    )

    return LawyerDashboardOut(
        kpis=DashboardKpisOut(
            pendingRequests=pending_requests,
            incomingBookings=incoming_bookings,
            tokenQueueToday=token_queue_today,
            kycStatus=kyc_status,
        ),
        profile=profile_out,
        apprenticeship=apprenticeship_out,
    )


@router.get("/cases", response_model=list[LawyerCaseSummaryOut])
def list_my_cases(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_lawyer_user(user)

    approved_request_statuses = ["approved", "accepted", "confirmed"]
    approved_case_statuses = ["approved", "accepted", "confirmed", "active", "open"]

    rows = (
        db.query(Case, User.full_name)
        .join(User, Case.client_id == User.id)
        .outerjoin(CaseRequest, CaseRequest.case_id == Case.id)
        .filter(
            (
                (CaseRequest.lawyer_id == user.id)
                & (func.lower(CaseRequest.status).in_(approved_request_statuses))
            )
            | (
                (Case.selected_lawyer_id == user.id)
                & (func.lower(Case.status).in_(approved_case_statuses))
            )
        )
        .distinct(Case.id)
        .order_by(Case.created_at.desc())
        .all()
    )

    return [
        LawyerCaseSummaryOut(
            id=case.id,
            title=case.title,
            status=case.status,
            client_name=client_name,
        )
        for case, client_name in rows
    ]


@router.get("/profile/me", response_model=LawyerProfileOut)
def get_my_lawyer_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_lawyer_user(user)

    profile = db.query(LawyerProfile).filter(LawyerProfile.user_id == user.id).first()

    # OK Map fields based on your Lawyer model
    return LawyerProfileOut(
        name=getattr(user, "full_name", None) or "Lawyer",
        email=getattr(user, "email", "") or "",
        phone=getattr(user, "phone", None),
        district=getattr(profile, "district", None),
        specialization=getattr(profile, "specialization", None),
        experienceYears=getattr(profile, "years_of_experience", None),
        languages=getattr(profile, "languages", None),
        avatarUrl=None,
        bio=getattr(profile, "bio", None),
    )
