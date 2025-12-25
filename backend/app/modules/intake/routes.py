from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.intake.models import IntakeForm
from app.modules.intake.schemas import IntakeCreate, IntakeOut


router = APIRouter(prefix="/api/intake", tags=["Intake"])


@router.post("", response_model=IntakeOut)
def create_intake(intake: IntakeCreate, db: Session = Depends(get_db)):
    obj = IntakeForm(
        booking_id=intake.booking_id,
        client_notes=intake.client_notes,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("", response_model=IntakeOut)
def get_latest_intake(booking_id: int, db: Session = Depends(get_db)):
    obj = (
        db.query(IntakeForm)
        .filter(IntakeForm.booking_id == booking_id)
        .order_by(IntakeForm.id.desc())
        .first()
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Intake form not found")
    return obj

