from datetime import date, datetime, timezone

import sqlalchemy as sa
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.modules.queue.models import QueueEntry, QueueEntryStatus


def generate_today_queue(db: Session, *, lawyer_id: int, today: date) -> list[QueueEntry]:
    """
    Generates token_queue entries for today's scheduled bookings.
    Only creates entries that don't already exist for the same client.
    Newly created entries start as `pending`.
    """
    bookings_stmt = (
        sa.select(Booking)
        .where(
            Booking.lawyer_id == lawyer_id,
            Booking.scheduled_at.is_not(None),
            sa.func.date(Booking.scheduled_at) == today,
            Booking.status != "cancelled",
        )
        .order_by(Booking.scheduled_at.asc())
    )
    bookings = list(db.execute(bookings_stmt).scalars().all())

    existing_clients_stmt = sa.select(QueueEntry.client_id).where(
        QueueEntry.date == today,
        QueueEntry.lawyer_id == lawyer_id,
    )
    existing_clients = set(db.execute(existing_clients_stmt).scalars().all())

    max_number_stmt = sa.select(sa.func.max(QueueEntry.token_number)).where(
        QueueEntry.date == today,
        QueueEntry.lawyer_id == lawyer_id,
    )
    max_number = db.execute(max_number_stmt).scalar_one_or_none() or 0

    next_number = max_number + 1
    created: list[QueueEntry] = []

    for booking in bookings:
        if booking.client_id in existing_clients:
            continue

        entry = QueueEntry(
            date=today,
            token_number=next_number,
            lawyer_id=lawyer_id,
            client_id=booking.client_id,
            status=QueueEntryStatus.pending,  # ✅ fixed (was waiting)
        )
        db.add(entry)
        created.append(entry)
        existing_clients.add(booking.client_id)
        next_number += 1

    if not created:
        return []

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Queue already generated (conflict while assigning queue numbers)",
        )

    for entry in created:
        db.refresh(entry)

    return created


def list_today_queue(db: Session, *, lawyer_id: int, today: date) -> list[QueueEntry]:
    """
    Returns today's queue entries for the lawyer.
    Shows active statuses (pending/confirmed/in_progress).
    """
    stmt = (
        sa.select(QueueEntry)
        .where(
            QueueEntry.date == today,
            QueueEntry.lawyer_id == lawyer_id,
            QueueEntry.status.in_(
                [
                    QueueEntryStatus.pending,
                    QueueEntryStatus.confirmed,
                    QueueEntryStatus.in_progress,
                ]
            ),  # ✅ fixed (was waiting)
        )
        .order_by(QueueEntry.token_number.asc())
    )
    return list(db.execute(stmt).scalars().all())


def mark_queue_entry_served(db: Session, *, lawyer_id: int, entry_id) -> QueueEntry:
    """
    Marks an entry as completed and sets completed_at.
    (Because enum has no 'served' status.)
    """
    entry = db.get(QueueEntry, entry_id)
    if entry is None or entry.lawyer_id != lawyer_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Queue entry not found")

    if entry.status != QueueEntryStatus.completed:
        entry.status = QueueEntryStatus.completed  # ✅ fixed (was served)
        entry.completed_at = datetime.now(timezone.utc)  # ✅ fixed (was served_at)
        db.commit()
        db.refresh(entry)

    return entry
