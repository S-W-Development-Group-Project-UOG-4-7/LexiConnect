from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.availability import AvailabilitySlot
from ..schemas.availability import AvailabilityCreate, AvailabilityOut

router = APIRouter(prefix="/availability", tags=["Availability"])


@router.post(
    "",
    response_model=AvailabilityOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new availability slot",
)
def create_availability_slot(
    payload: AvailabilityCreate,
    db: Session = Depends(get_db),
):
    """Create a new availability slot for a lawyer."""
    if payload.end_time <= payload.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_time must be after start_time",
        )

    slot = AvailabilitySlot(
        lawyer_id=payload.lawyer_id,
        branch_id=payload.branch_id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        max_bookings=payload.max_bookings,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


@router.get(
    "",
    response_model=List[AvailabilityOut],
    summary="List availability slots",
)
def list_availability_slots(
    lawyer_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """List availability slots, optionally filtered by lawyer_id."""
    query = db.query(AvailabilitySlot)
    if lawyer_id is not None:
        query = query.filter(AvailabilitySlot.lawyer_id == lawyer_id)
    return query.order_by(AvailabilitySlot.start_time).all()
