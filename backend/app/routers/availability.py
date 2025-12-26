from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.availability_v2 import availability_v2Slot
from ..schemas.availability_v2 import availability_v2Create, availability_v2Out

router = APIRouter(prefix="/availability_v2", tags=["availability_v2"])


@router.post(
    "",
    response_model=availability_v2Out,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new availability_v2 slot",
)
def create_availability_v2_slot(
    payload: availability_v2Create,
    db: Session = Depends(get_db),
):
    """Create a new availability_v2 slot for a lawyer."""
    if payload.end_time <= payload.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_time must be after start_time",
        )

    slot = availability_v2Slot(
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
    response_model=List[availability_v2Out],
    summary="List availability_v2 slots",
)
def list_availability_v2_slots(
    lawyer_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """List availability_v2 slots, optionally filtered by lawyer_id."""
    query = db.query(availability_v2Slot)
    if lawyer_id is not None:
        query = query.filter(availability_v2Slot.lawyer_id == lawyer_id)
    return query.order_by(availability_v2Slot.start_time).all()

# TEMP: availability_v2 logic updated
# Author: Vithana
