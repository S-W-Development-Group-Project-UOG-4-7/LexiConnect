from datetime import date, time

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.appointment import Appointment
from ...schemas.appointment import AppointmentOut


router = APIRouter(prefix="/booking", tags=["Booking"])


class BookingCreateMinimal(BaseModel):
    """Minimal booking details for creating an appointment."""
    lawyer_id: int
    client_id: int
    date: date
    time: time
    branch_id: int = 1  # Default branch_id, can be overridden


@router.post(
    "/create",
    response_model=AppointmentOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new appointment booking",
)
def create_booking(
    payload: BookingCreateMinimal,
    db: Session = Depends(get_db),
):
    """
    Create a new appointment booking with minimal details.
    Requires: lawyer_id, client_id, date, time.
    branch_id defaults to 1 if not provided.
    """
    appointment = Appointment(
        lawyer_id=payload.lawyer_id,
        client_id=payload.client_id,
        branch_id=payload.branch_id,
        date=payload.date,
        start_time=payload.time,
        # status defaults to CONFIRMED in the model
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    return appointment

