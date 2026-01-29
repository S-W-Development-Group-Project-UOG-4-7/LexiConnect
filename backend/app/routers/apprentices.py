from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/apprentices", tags=["Apprentices"])


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


@router.get("/search")
def search_apprentices(
    q: str = Query("", min_length=1),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Only lawyers/admin can search
    if _role_str(user) not in ("lawyer", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    query = q.strip()
    if not query:
        return []

    base = db.query(User).filter(User.role == "apprentice")

    # numeric -> search by id too
    if query.isdigit():
        base = base.filter(
            or_(
                User.id == int(query),
                User.full_name.ilike(f"%{query}%"),
                User.email.ilike(f"%{query}%"),
            )
        )
    else:
        base = base.filter(
            or_(
                User.full_name.ilike(f"%{query}%"),
                User.email.ilike(f"%{query}%"),
            )
        )

    rows = base.order_by(User.id.desc()).limit(15).all()

    return [{"id": u.id, "full_name": u.full_name, "email": u.email} for u in rows]
