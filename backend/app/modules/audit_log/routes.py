from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.routers.auth import get_current_user
from .models import AuditLog
from .schemas import AuditLogOut

router = APIRouter(prefix="/api/admin/audit-logs", tags=["Admin Audit Logs"])


def _require_admin(user: User):
    role = getattr(user, "role", None)
    if role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin only")


@router.get("", response_model=List[AuditLogOut])
def list_audit_logs(
    q: Optional[str] = Query(None, description="Search text"),
    action: Optional[str] = Query(None, description="Filter by action"),
    days: int = Query(7, ge=1, le=365, description="Lookback window in days"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)

    cutoff = datetime.utcnow() - timedelta(days=days)
    query = db.query(AuditLog).filter(AuditLog.created_at >= cutoff)

    if action:
        query = query.filter(AuditLog.action == action)

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                AuditLog.user_email.ilike(like),
                AuditLog.action.ilike(like),
                AuditLog.description.ilike(like),
            )
        )

    logs = (
        query.order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return logs
