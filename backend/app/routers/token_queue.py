import uuid
from datetime import date, datetime, timezone
import logging

import sqlalchemy as sa
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.modules.queue.models import QueueEntry, QueueEntryStatus
from app.schemas.token_queue import TokenQueueCreate, TokenQueueOut, TokenQueueUpdate
from app.routers.auth import get_current_user

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
        time=payload.time,
        lawyer_id=payload.lawyer_id,
        client_id=payload.client_id,
        branch_id=payload.branch_id,
        reason=payload.reason,
        notes=payload.notes,
        status=payload.status or QueueEntryStatus.pending,
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
    data = TokenQueueOut.model_validate(entry)
    data.client_name = client.full_name if client else None
    return data


@router.get("", response_model=list[TokenQueueOut])
def list_token_queue_entries(
    date: date | None = Query(None),
    lawyer_id: int | None = Query(None),
    status: QueueEntryStatus | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List token queue entries. Lawyers see only their own queue."""
    stmt = sa.select(QueueEntry)

    # Lawyers can only see their own queue
    if current_user.role == UserRole.lawyer:
        from app.modules.branches.service import get_lawyer_by_user
        lawyer = get_lawyer_by_user(db, current_user.email)
        if lawyer:
            stmt = stmt.where(QueueEntry.lawyer_id == lawyer.id)

    if date is not None:
        stmt = stmt.where(QueueEntry.date == date)

    if lawyer_id is not None:
        # Admins can filter by lawyer_id
        if current_user.role == UserRole.admin:
            stmt = stmt.where(QueueEntry.lawyer_id == lawyer_id)

    if status is not None:
        stmt = stmt.where(QueueEntry.status == status)

    stmt = stmt.order_by(QueueEntry.date.desc(), QueueEntry.token_number.asc())

    entries = list(db.execute(stmt).scalars().all())
    
    # Build response with client names
    result = []
    for e in entries:
        client = db.get(User, e.client_id)
        data = TokenQueueOut.model_validate(e)
        data.client_name = client.full_name if client else None
        result.append(data)
    
    return result


@router.get("/{entry_id}", response_model=TokenQueueOut)
def get_token_queue_entry(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    entry = db.get(QueueEntry, entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token queue entry not found")
    client = db.get(User, entry.client_id)
    data = TokenQueueOut.model_validate(entry)
    data.client_name = client.full_name if client else None
    return data


@router.patch("/{entry_id}", response_model=TokenQueueOut)
def update_token_queue_entry(
    entry_id: uuid.UUID,
    payload: TokenQueueUpdate,
    db: Session = Depends(get_db),
):
    entry = db.get(QueueEntry, entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token queue entry not found")

    previous_status = entry.status
    entry.status = payload.status

    # Auto-set timestamps based on status changes
    if payload.status == QueueEntryStatus.in_progress and previous_status != QueueEntryStatus.in_progress:
        entry.started_at = datetime.now(timezone.utc)
    
    if payload.status == QueueEntryStatus.completed and previous_status != QueueEntryStatus.completed:
        entry.completed_at = datetime.now(timezone.utc)

    if payload.notes is not None:
        entry.notes = payload.notes

    if payload.started_at is not None:
        entry.started_at = payload.started_at

    if payload.completed_at is not None:
        entry.completed_at = payload.completed_at

    db.commit()
    db.refresh(entry)
    client = db.get(User, entry.client_id)
    data = TokenQueueOut.model_validate(entry)
    data.client_name = client.full_name if client else None
    return data


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_token_queue_entry(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    entry = db.get(QueueEntry, entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token queue entry not found")
    
    db.delete(entry)
    db.commit()
    return None
