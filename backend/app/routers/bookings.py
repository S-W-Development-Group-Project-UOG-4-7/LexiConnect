from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.routers.auth import get_current_user
from app.schemas.booking import BookingCreate, BookingOut
from app.models.user import User

router = APIRouter(prefix="/bookings", tags=["bookings"])


def require_role(user: User, allowed_roles: list[str]):
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can create bookings",
        )


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_role(current_user, ["client"])

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
