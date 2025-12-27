from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.booking import Booking

from .models import Dispute


def create_dispute(db: Session, client_id: int, booking_id: int, title: str, description: str) -> Dispute:
    """Create a dispute for a booking that belongs to the given client."""
    if not booking_id:
        raise HTTPException(status_code=400, detail="booking_id is required")

    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id, Booking.client_id == client_id)
        .first()
    )
    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found for this client",
        )

    dispute = Dispute(
        booking_id=booking_id,
        client_id=client_id,
        title=title,
        description=description,
        status="PENDING",
        admin_note=None,
    )
    db.add(dispute)
    db.commit()
    db.refresh(dispute)
    return dispute
