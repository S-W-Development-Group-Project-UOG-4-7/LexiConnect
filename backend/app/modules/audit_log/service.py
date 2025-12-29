from typing import Any, Optional
from sqlalchemy.orm import Session

from app.models.user import User
from .models import AuditLog


def log_event(
    db: Session,
    *,
    user: Optional[User],
    action: str,
    description: str,
    meta: Optional[Any] = None,
) -> AuditLog:
    entry = AuditLog(
        user_id=getattr(user, "id", None),
        user_email=getattr(user, "email", None),
        action=action,
        description=description,
        meta=meta,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
