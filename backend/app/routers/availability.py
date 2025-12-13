from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.availability import AvailabilitySlot
from ..schemas.availability import AvailabilityCreate, AvailabilityOut, AvailabilityUpdate

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
    lawyer_id = 1  # TODO: replace with auth-based lawyer_id later

    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start_time must be before end_time")

    existing = (
        db.query(AvailabilitySlot)
        .filter(
            AvailabilitySlot.lawyer_id == lawyer_id,
            AvailabilitySlot.is_active.is_(True),
            AvailabilitySlot.start_time < payload.end_time,
            AvailabilitySlot.end_time > payload.start_time,
        )
        .first()
    )
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Availability slot overlaps with an existing slot")

    slot = AvailabilitySlot(
        lawyer_id=lawyer_id,
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
    lawyer_id: int = Query(...),
    from_: Optional[datetime] = Query(None, alias="from"),
    to: Optional[datetime] = Query(None),
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db),
):
    query = db.query(AvailabilitySlot).filter(AvailabilitySlot.lawyer_id == lawyer_id)
    if not include_inactive:
        query = query.filter(AvailabilitySlot.is_active.is_(True))
    if from_ is not None:
        query = query.filter(AvailabilitySlot.start_time >= from_)
    if to is not None:
        query = query.filter(AvailabilitySlot.end_time <= to)
    return query.order_by(AvailabilitySlot.start_time).all()


@router.patch(
    "/{slot_id}",
    response_model=AvailabilityOut,
    summary="Update availability slot",
)
def update_availability_slot(
    slot_id: int,
    payload: AvailabilityUpdate,
    db: Session = Depends(get_db),
):
    slot = db.query(AvailabilitySlot).filter(AvailabilitySlot.id == slot_id).first()
    if slot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Availability slot not found")

    if payload.is_active is not None:
        slot.is_active = payload.is_active
    if payload.max_bookings is not None:
        if payload.max_bookings < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="max_bookings must be >= 1")
        slot.max_bookings = payload.max_bookings

    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


@router.delete(
    "/{slot_id}",
    response_model=AvailabilityOut,
    summary="Soft delete availability slot",
)
def delete_availability_slot(
    slot_id: int,
    db: Session = Depends(get_db),
):
    slot = db.query(AvailabilitySlot).filter(AvailabilitySlot.id == slot_id).first()
    if slot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Availability slot not found")

    slot.is_active = False
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot
