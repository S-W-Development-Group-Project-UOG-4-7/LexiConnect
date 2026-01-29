from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, aliased

from app.database import get_db
from app.models.booking import Booking
from app.modules.cases.models import Case
from app.routers.auth import get_current_user
from app.schemas.booking import BookingCreate, BookingOut, BookingCancelOut, BookingSummaryOut
from app.models.user import User
from app.modules.audit_log.service import log_event
from app.modules.blackouts.models import BlackoutDay
from app.modules.lawyer_profiles.models import LawyerProfile
from app.models.branch import Branch
from app.models.service_package import ServicePackage

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new booking. Only clients can create bookings."""
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can create bookings",
        )

    if booking_in.case_id is None:
        raise HTTPException(status_code=422, detail="case_id required")

    case = db.query(Case).filter(Case.id == booking_in.case_id).first()
    if not case or case.client_id != current_user.id:
        raise HTTPException(status_code=400, detail="Invalid case for this client")

    # Prevent bookings on blackout days for the lawyer
    if booking_in.scheduled_at:
        try:
            scheduled_date = booking_in.scheduled_at.date()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid scheduled_at value")

        blackout = (
            db.query(BlackoutDay)
            .filter(BlackoutDay.lawyer_id == booking_in.lawyer_id, BlackoutDay.date == scheduled_date)
            .first()
        )
        if blackout:
            raise HTTPException(status_code=400, detail="Lawyer unavailable on this date")

    booking = Booking(
        client_id=current_user.id,
        lawyer_id=booking_in.lawyer_id,
        branch_id=booking_in.branch_id,
        scheduled_at=booking_in.scheduled_at,
        note=booking_in.note,
        service_package_id=booking_in.service_package_id,
        case_id=booking_in.case_id,
        status="pending",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return BookingOut.model_validate(booking)


@router.get("/my", response_model=list[BookingOut])
def list_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List bookings for the current user. Clients see their bookings, lawyers see bookings assigned to them."""
    if current_user.role == "client":
        bookings = (
            db.query(Booking)
            .filter(Booking.client_id == current_user.id)
            .order_by(Booking.created_at.desc())
            .all()
        )
    elif current_user.role == "lawyer":
        bookings = (
            db.query(Booking)
            .filter(Booking.lawyer_id == current_user.id)
            .order_by(Booking.created_at.desc())
            .all()
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients and lawyers can list bookings",
        )
    
    return [BookingOut.model_validate(b) for b in bookings]


@router.get("/my/summary", response_model=list[BookingSummaryOut])
def list_my_bookings_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lawyer_user = aliased(User)
    profile = aliased(LawyerProfile)

    base_query = (
        db.query(
            Booking,
            lawyer_user.full_name,
            profile.specialization,
            profile.city,
            profile.district,
            Branch.name,
            Branch.city,
            ServicePackage.name,
            Case.title,
            Case.summary_public,
        )
        .join(lawyer_user, Booking.lawyer_id == lawyer_user.id)
        .outerjoin(profile, profile.user_id == lawyer_user.id)
        .outerjoin(Branch, Booking.branch_id == Branch.id)
        .outerjoin(ServicePackage, Booking.service_package_id == ServicePackage.id)
        .outerjoin(Case, Booking.case_id == Case.id)
    )

    if current_user.role == "client":
        base_query = base_query.filter(Booking.client_id == current_user.id)
    elif current_user.role == "lawyer":
        base_query = base_query.filter(Booking.lawyer_id == current_user.id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients and lawyers can list bookings",
        )

    rows = base_query.order_by(Booking.created_at.desc()).all()

    summaries = []
    for (
        booking,
        lawyer_name,
        specialization,
        lawyer_city,
        lawyer_district,
        branch_name,
        branch_city,
        service_name,
        case_title,
        case_summary,
    ) in rows:
        summaries.append(
            BookingSummaryOut(
                id=booking.id,
                client_id=booking.client_id,
                lawyer_id=booking.lawyer_id,
                branch_id=booking.branch_id,
                service_package_id=booking.service_package_id,
                case_id=booking.case_id,
                scheduled_at=booking.scheduled_at,
                note=booking.note,
                status=booking.status,
                created_at=booking.created_at,
                updated_at=booking.updated_at,
                lawyer_name=lawyer_name,
                lawyer_specialization=specialization,
                lawyer_city=lawyer_city,
                lawyer_district=lawyer_district,
                branch_name=branch_name,
                branch_city=branch_city,
                service_name=service_name,
                case_title=case_title,
                case_summary=case_summary,
            )
        )

    return summaries


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get booking details. Allowed for client owner OR lawyer owner."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # Check if user is the client owner or lawyer owner
    is_client_owner = booking.client_id == current_user.id
    is_lawyer_owner = booking.lawyer_id == current_user.id

    if not (is_client_owner or is_lawyer_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this booking",
        )

    return BookingOut.model_validate(booking)


@router.patch("/{booking_id}/cancel", response_model=BookingCancelOut)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel a booking. Only the client owner can cancel."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # Only client owner can cancel
    if booking.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the client who owns this booking can cancel it",
        )

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    log_event(
        db,
        user=current_user,
        action="BOOKING_CANCELLED",
        description=f"Booking {booking.id} cancelled by client",
        meta={
            "booking_id": booking.id,
            "client_id": booking.client_id,
            "lawyer_id": booking.lawyer_id,
        },
    )
    return BookingCancelOut.model_validate(booking)


@router.get("/lawyer/incoming", response_model=list[BookingOut])
def list_lawyer_incoming_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List incoming booking requests for the current lawyer (status: pending).
    Only available for lawyers.
    """
    if current_user.role != "lawyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lawyers can view incoming bookings",
        )

    bookings = (
        db.query(Booking)
        .filter(
            Booking.lawyer_id == current_user.id,
            Booking.status == "pending",
        )
        .order_by(Booking.created_at.desc())
        .all()
    )

    return [BookingOut.model_validate(b) for b in bookings]


@router.patch("/{booking_id}/confirm", response_model=BookingOut)
def confirm_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Confirm a booking request. Only the assigned lawyer can confirm pending bookings."""
    if current_user.role != "lawyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lawyers can confirm bookings",
        )

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # Check if user is the assigned lawyer
    if booking.lawyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only confirm bookings assigned to you",
        )

    # Check if booking is pending
    if booking.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot confirm booking with status '{booking.status}'. Only pending bookings can be confirmed.",
        )

    booking.status = "confirmed"
    db.commit()
    db.refresh(booking)
    log_event(
        db,
        user=current_user,
        action="BOOKING_CONFIRMED",
        description=f"Booking {booking.id} confirmed by lawyer",
        meta={
            "booking_id": booking.id,
            "lawyer_id": booking.lawyer_id,
            "client_id": booking.client_id,
        },
    )
    return BookingOut.model_validate(booking)


@router.patch("/{booking_id}/reject", response_model=BookingOut)
def reject_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reject a booking request. Only the assigned lawyer can reject pending bookings."""
    if current_user.role != "lawyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lawyers can reject bookings",
        )

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # Check if user is the assigned lawyer
    if booking.lawyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only reject bookings assigned to you",
        )

    # Check if booking is pending
    if booking.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject booking with status '{booking.status}'. Only pending bookings can be rejected.",
        )

    booking.status = "rejected"
    db.commit()
    db.refresh(booking)
    log_event(
        db,
        user=current_user,
        action="BOOKING_REJECTED",
        description=f"Booking {booking.id} rejected by lawyer",
        meta={
            "booking_id": booking.id,
            "lawyer_id": booking.lawyer_id,
            "client_id": booking.client_id,
        },
    )
    return BookingOut.model_validate(booking)
