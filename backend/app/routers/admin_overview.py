from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.kyc_submission import KYCSubmission
from app.models.user import User, UserRole
from app.modules.lawyer_profiles.models import LawyerProfile
from app.routers.auth import get_current_user
from app.schemas.admin_overview import AdminOverviewResponse, LawyerOverview, RecentBooking

router = APIRouter(prefix="/api/admin", tags=["Admin Overview"])


def _require_admin(current_user: User):
    role = getattr(current_user, "role", None)
    if role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin only")


@router.get("/overview", response_model=AdminOverviewResponse)
def admin_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)

    total_users = db.query(User).count()
    total_lawyers = db.query(User).filter(User.role == UserRole.lawyer).count()
    total_bookings = db.query(Booking).count()

    pending_kyc = db.query(KYCSubmission).filter(KYCSubmission.status == "pending").count()
    verified_lawyers = db.query(KYCSubmission).filter(KYCSubmission.status == "approved").count()

    recent_booking_rows = (
        db.query(Booking, User)
        .join(User, Booking.client_id == User.id)
        .order_by(Booking.created_at.desc())
        .limit(5)
        .all()
    )

    recent_bookings = [
        RecentBooking(
            id=booking.id,
            client_name=client.full_name,
            status=booking.status,
            scheduled_at=booking.scheduled_at,
            created_at=booking.created_at,
        )
        for booking, client in recent_booking_rows
    ]

    # preload profiles
    profiles = db.query(LawyerProfile).all()
    profile_map = {p.user_id: p for p in profiles}

    # latest kyc per lawyer (assumes lawyer_id aligns to user_id)
    latest_kyc_map = {}
    for sub in db.query(KYCSubmission).order_by(KYCSubmission.submitted_at.desc()).all():
        if sub.lawyer_id not in latest_kyc_map:
            latest_kyc_map[sub.lawyer_id] = sub

    lawyers = []
    lawyer_users = db.query(User).filter(User.role == UserRole.lawyer).all()
    for user in lawyer_users:
        profile = profile_map.get(user.id)
        kyc = latest_kyc_map.get(user.id)

        specialization = profile.specialization if profile and profile.specialization else "General"
        kyc_status = kyc.status if kyc else "not_submitted"
        is_verified = kyc_status == "approved"

        lawyers.append(
            LawyerOverview(
                user_id=user.id,
                full_name=user.full_name,
                specialization=specialization,
                kyc_status=kyc_status,
                is_verified=is_verified,
            )
        )

    return AdminOverviewResponse(
        total_users=total_users,
        total_lawyers=total_lawyers,
        total_bookings=total_bookings,
        pending_kyc=pending_kyc,
        verified_lawyers=verified_lawyers,
        recent_bookings=recent_bookings,
        lawyers=lawyers,
    )
