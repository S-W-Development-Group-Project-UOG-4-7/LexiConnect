from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import get_current_user
from app.models.user import UserRole
from app.modules.cases.models import Case
from app.modules.cases.models import CaseRequest  # adjust import if your CaseRequest is elsewhere

router = APIRouter(prefix="/lawyer", tags=["Lawyer Cases"])


def _role_str(user) -> str:
    role = getattr(user, "role", None)
    if role is None:
        return ""
    val = getattr(role, "value", None)
    if val:
        return str(val).lower()
    s = str(role).strip().lower()
    if "." in s:
        s = s.split(".")[-1]
    return s


@router.get("/cases")
def get_my_approved_cases(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    role = _role_str(user)
    if role not in ("lawyer", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Lawyer access only")

    # ✅ Approved cases = case_requests approved for THIS lawyer user_id
    approved_statuses = ["approved", "accepted", "confirmed"]

    rows = (
        db.query(Case)
        .join(CaseRequest, CaseRequest.case_id == Case.id)
        .filter(
            CaseRequest.lawyer_id == user.id,   # IMPORTANT: your CaseApprentice uses lawyer_id=users.id, so match that
            CaseRequest.status.in_(approved_statuses),
        )
        .order_by(Case.id.desc())
        .all()
    )

    # frontend expects minimal list for dropdown
    out = []
    for c in rows:
        out.append(
            {
                "id": c.id,
                "title": getattr(c, "title", None) or f"Case #{c.id}",
                "status": getattr(c, "status", None) or "approved",
                "category": getattr(c, "category", None),
                "district": getattr(c, "district", None),
            }
        )

    return out
