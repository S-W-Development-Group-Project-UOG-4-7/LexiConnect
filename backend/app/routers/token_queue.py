import uuid
from datetime import date, datetime, timezone
import logging

import sqlalchemy as sa
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.modules.queue.models import QueueEntry, QueueEntryStatus
from app.schemas.token_queue import TokenQueueCreate, TokenQueueOut, TokenQueueUpdate

router = APIRouter(prefix="/token-queue", tags=["Token Queue"])
logger = logging.getLogger(__name__)

@router.post("", response_model=TokenQueueOut, status_code=status.HTTP_201_CREATED)
def create_token_queue_entry(payload: TokenQueueCreate, db: Session = Depends(get_db)):
    lawyer = db.get(User, payload.lawyer_id)
    if lawyer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lawyer user not found (id={payload.lawyer_id})",
        )

    client = db.get(User, payload.client_id)
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client user not found (id={payload.client_id})",
        )

    logger.info(
        "TokenQueue conflict check values date=%s lawyer_id=%s token_number=%s",
        payload.date,
        payload.lawyer_id,
        payload.token_number,
    )

    existing = (
        db.query(QueueEntry)
        .filter(
            QueueEntry.date == payload.date,
            QueueEntry.lawyer_id == payload.lawyer_id,
            QueueEntry.token_number == payload.token_number,
        )
        .first()
    )

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Token queue entry already exists (id={existing.id})",
        )

    entry = QueueEntry(
        id=uuid.uuid4(),
        date=payload.date,
        token_number=payload.token_number,
        lawyer_id=payload.lawyer_id,
        client_id=payload.client_id,
        status=payload.status or QueueEntryStatus.waiting,
    )

    db.add(entry)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        logger.exception(
            "TokenQueue commit failed (IntegrityError) date=%s lawyer_id=%s token_number=%s client_id=%s",
            payload.date,
            payload.lawyer_id,
            payload.token_number,
            payload.client_id,
        )

        existing_after_error = (
            db.query(QueueEntry)
            .filter(
                QueueEntry.date == payload.date,
                QueueEntry.lawyer_id == payload.lawyer_id,
                QueueEntry.token_number == payload.token_number,
            )
            .first()
        )

        logger.info(
            "TokenQueue commit IntegrityError; duplicate_recheck_found=%s existing_id=%s",
            existing_after_error is not None,
            str(existing_after_error.id) if existing_after_error is not None else None,
        )

        if existing_after_error is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Token queue entry already exists (id={existing_after_error.id})",
            )

        pgcode = getattr(getattr(e, "orig", None), "pgcode", None)
        orig_msg = str(getattr(e, "orig", e))

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database integrity error (pgcode={pgcode}): {orig_msg}",
        )

    except SQLAlchemyError as e:
        db.rollback()
        logger.exception(
            "TokenQueue commit failed (SQLAlchemyError) date=%s lawyer_id=%s token_number=%s client_id=%s",
            payload.date,
            payload.lawyer_id,
            payload.token_number,
            payload.client_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while creating token queue entry",
        )

    db.refresh(entry)
    return TokenQueueOut.model_validate(entry)

@router.get("", response_model=list[TokenQueueOut])
def list_token_queue_entries(
    date: date | None = None,
    lawyer_id: int | None = None,
    status: QueueEntryStatus | None = None,
    db: Session = Depends(get_db),
):
    stmt = sa.select(QueueEntry)

    if date is not None:
        stmt = stmt.where(QueueEntry.date == date)

    if lawyer_id is not None:
        stmt = stmt.where(QueueEntry.lawyer_id == lawyer_id)

    if status is not None:
        stmt = stmt.where(QueueEntry.status == status)

    stmt = stmt.order_by(QueueEntry.date.desc(), QueueEntry.token_number.asc())

    entries = list(db.execute(stmt).scalars().all())
    return [TokenQueueOut.model_validate(e) for e in entries]


@router.patch("/{id}", response_model=TokenQueueOut)
def update_token_queue_entry(
    id: uuid.UUID,
    payload: TokenQueueUpdate,
    db: Session = Depends(get_db),
):
    entry = db.get(QueueEntry, id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token queue entry not found")

    previous_status = entry.status
    entry.status = payload.status

    if payload.served_at is not None:
        entry.served_at = payload.served_at
    else:
        if previous_status != QueueEntryStatus.served and payload.status == QueueEntryStatus.served:
            entry.served_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(entry)
    return TokenQueueOut.model_validate(entry)
