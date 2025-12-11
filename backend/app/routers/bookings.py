from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.routers.auth import get_current_user
from app.schemas.booking import BookingCreate, BookingOut
from app.models.user import User

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = Booking(
        client_id=current_user.id,
        lawyer_id=booking_in.lawyer_id,
        branch_id=booking_in.branch_id,
        date=booking_in.date,
        time=booking_in.time,
        reason=booking_in.reason,
        status="PENDING",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _to_booking_out(booking)


@router.get("/my", response_model=list[BookingOut])
def list_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = (
        db.query(Booking)
        .filter(Booking.client_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return [_to_booking_out(b) for b in bookings]


@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking or booking.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    booking.status = "CANCELLED"
    db.commit()
    db.refresh(booking)
    return _to_booking_out(booking)


def _to_booking_out(booking: Booking) -> BookingOut:
    return BookingOut(
        id=booking.id,
        lawyer_name=getattr(getattr(booking, "lawyer", None), "full_name", None),
        branch_name=None,  # Placeholder until branch model is integrated
        date=booking.date,
        time=booking.time,
        status=booking.status,
    )
from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("")
def create_booking_dummy():
    """Return a fake booking as if it was created."""
    return {
        "id": 1,
        "client_id": 10,
        "lawyer_id": 1,
        "branch_id": 1,
        "date": "2025-12-10",
        "time": "10:00",
        "status": "PENDING",
        "created_at": datetime.utcnow().isoformat(),
    }


@router.get("/my")
def list_my_bookings_dummy():
    """Return a list of fake bookings for the current user."""
    return [
        {
            "id": 1,
            "lawyer_name": "A. Perera",
            "branch_name": "Main Chamber",
            "date": "2025-12-10",
            "time": "10:00",
            "status": "PENDING",
        },
        {
            "id": 2,
            "lawyer_name": "B. Silva",
            "branch_name": "Negombo Office",
            "date": "2025-12-12",
            "time": "14:00",
            "status": "CONFIRMED",
        },
    ]


@router.patch("/{booking_id}/cancel")
def cancel_booking_dummy(booking_id: int):
    """Return a booking marked as cancelled."""
    return {
        "id": booking_id,
        "status": "CANCELLED",
        "message": "This is a dummy cancel endpoint.",
    }
