from datetime import datetime, timezone
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from .models import Notification


def create_notification(
    db: Session,
    user_id: int,
    type: str,
    title: str,
    message: str,
    body: Optional[str] = None,
    meta: Optional[Dict[str, Any]] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    commit: bool = True,
) -> Notification:
    resolved_body = body or message
    resolved_meta = meta or {}
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        body=resolved_body,
        meta=resolved_meta,
        entity_type=entity_type,
        entity_id=entity_id,
        is_read=False,
        created_at=datetime.now(timezone.utc),
    )
    db.add(notification)
    if commit:
        db.commit()
        db.refresh(notification)
    else:
        db.flush()
    return notification
