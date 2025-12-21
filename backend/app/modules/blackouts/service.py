import sqlalchemy as sa
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.modules.blackouts.models import BlackoutDay
from app.modules.blackouts.schemas import BlackoutCreate


def create_blackout(db: Session, *, lawyer_id: int, payload: BlackoutCreate) -> BlackoutDay:
    blackout = BlackoutDay(
        lawyer_id=lawyer_id,
        date=payload.date,
        reason=payload.reason,
    )

    db.add(blackout)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Blackout already exists for this date",
        )

    db.refresh(blackout)
    return blackout


def list_my_blackouts(db: Session, *, lawyer_id: int) -> list[BlackoutDay]:
    stmt = (
        sa.select(BlackoutDay)
        .where(BlackoutDay.lawyer_id == lawyer_id)
        .order_by(BlackoutDay.date.asc())
    )
    return list(db.execute(stmt).scalars().all())


def delete_blackout(db: Session, *, lawyer_id: int, blackout_id) -> None:
    blackout = db.get(BlackoutDay, blackout_id)
    if blackout is None or blackout.lawyer_id != lawyer_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blackout not found")

    db.delete(blackout)
    db.commit()
