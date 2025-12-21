"""Queue module (Vithana)

Endpoints (mounted by leader):
- POST   /api/queue/today/generate
- GET    /api/queue/today
- PATCH  /api/queue/{id}/mark-served
"""

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.modules.queue.schemas import QueueEntryOut
from app.modules.queue.service import generate_today_queue, list_today_queue, mark_queue_entry_served

router = APIRouter(prefix="/api/queue", tags=["queue"])


def _require_lawyer(current_user: User) -> None:
    if current_user.role != "lawyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lawyers can access this endpoint",
        )


@router.post("/today/generate", response_model=list[QueueEntryOut], status_code=status.HTTP_201_CREATED)
def generate_queue_for_today(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    today = date.today()
    entries = generate_today_queue(db, lawyer_id=current_user.id, today=today)
    return [QueueEntryOut.model_validate(e) for e in entries]


@router.get("/today", response_model=list[QueueEntryOut])
def list_my_today_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    today = date.today()
    entries = list_today_queue(db, lawyer_id=current_user.id, today=today)
    return [QueueEntryOut.model_validate(e) for e in entries]


@router.patch("/{id}/mark-served", response_model=QueueEntryOut)
def serve_queue_entry(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    entry = mark_queue_entry_served(db, lawyer_id=current_user.id, entry_id=id)
    return QueueEntryOut.model_validate(entry)
