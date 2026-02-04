from datetime import datetime, timezone
from typing import Optional

from starlette.requests import Request
from sqlalchemy.orm import Session

from .models import AuthLog


def create_auth_log(
    db: Session,
    *,
    event_type: str,
    success: bool,
    user_id: Optional[int] = None,
    message: Optional[str] = None,
    request: Optional[Request] = None,
    occurred_at: Optional[datetime] = None,
    commit: bool = True,
) -> AuthLog:
    entry = AuthLog(
        event_type=event_type,
        user_id=user_id,
        ip_address=request.client.host if request and request.client else None,
        user_agent=request.headers.get("user-agent") if request else None,
        success=success,
        message=message,
        occurred_at=occurred_at or datetime.now(timezone.utc),
    )
    db.add(entry)
    if commit:
        db.commit()
        db.refresh(entry)
    else:
        db.flush()
    return entry
