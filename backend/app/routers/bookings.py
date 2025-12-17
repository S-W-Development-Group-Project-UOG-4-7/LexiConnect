from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.routers.auth import get_current_user
from app.schemas.booking import BookingCreate, BookingOut, BookingCancelOut
from app.models.user import User

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

    booking = Booking(
        client_id=current_user.id,
        lawyer_id=booking_in.lawyer_id,
        branch_id=booking_in.branch_id,
        scheduled_at=booking_in.scheduled_at,
        note=booking_in.note,
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
    return BookingCancelOut.model_validate(booking)
