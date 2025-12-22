# backend/app/modules/disputes/routes.py

print("✅ LOADED disputes routes from:", __file__)

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import get_current_user

from app.modules.disputes.models import Dispute
from app.modules.disputes.schemas import (
    DisputeCreate,
    DisputeOut,
    DisputeUpdate,
    DisputeAdminUpdate,
)

router = APIRouter()


def _is_admin(user) -> bool:
    # works whether role is Enum or str
    role = getattr(user, "role", None)
    return str(role) in ("admin", "UserRole.admin")


def _is_client(user) -> bool:
    role = getattr(user, "role", None)
    return str(role) in ("client", "UserRole.client")


def _get_dispute_or_404(db: Session, dispute_id: int) -> Dispute:
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    return dispute


@router.get("/ping")
def ping():
    return {"ok": True, "module": "disputes"}


# 1) POST /api/disputes (client only)
@router.post("", response_model=DisputeOut, status_code=status.HTTP_201_CREATED)
def create_dispute(
    payload: DisputeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not _is_client(current_user):
        raise HTTPException(status_code=403, detail="Only clients can create disputes")

    dispute = Dispute(
        booking_id=payload.booking_id,
        client_id=current_user.id,
        title=payload.title,
        description=payload.description,
        status="PENDING",
        admin_note=None,
    )

    db.add(dispute)
    db.commit()
    db.refresh(dispute)
    return dispute


# 2) GET /api/disputes/my (client only)
@router.get("/my", response_model=List[DisputeOut])
def list_my_disputes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not _is_client(current_user):
        raise HTTPException(status_code=403, detail="Only clients can view this list")

    disputes = (
        db.query(Dispute)
        .filter(Dispute.client_id == current_user.id)
        .order_by(Dispute.id.desc())
        .all()
    )
    return disputes


# 3) GET /api/disputes/{id} (only owner OR admin)
@router.get("/{dispute_id}", response_model=DisputeOut)
def get_dispute(
    dispute_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    dispute = _get_dispute_or_404(db, dispute_id)

    if _is_admin(current_user) or dispute.client_id == current_user.id:
        return dispute

    raise HTTPException(status_code=403, detail="Not allowed to view this dispute")


# 4) PATCH /api/disputes/{id}
@router.patch("/{dispute_id}", response_model=DisputeOut)
def update_dispute(
    dispute_id: int,
    # we accept either payload type; FastAPI will validate based on fields
    client_update: Optional[DisputeUpdate] = None,
    admin_update: Optional[DisputeAdminUpdate] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    dispute = _get_dispute_or_404(db, dispute_id)

    # Admin path
    if _is_admin(current_user):
        if admin_update is None:
            # if request body matched DisputeUpdate instead, still allow only admin fields
            raise HTTPException(status_code=400, detail="Admin update payload required")

        if admin_update.status is not None:
            dispute.status = admin_update.status
        if admin_update.admin_note is not None:
            dispute.admin_note = admin_update.admin_note

        db.commit()
        db.refresh(dispute)
        return dispute

    # Client-owner path
    if dispute.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to update this dispute")

    if str(dispute.status) != "PENDING":
        raise HTTPException(status_code=400, detail="Only PENDING disputes can be updated by client")

    if client_update is None:
        raise HTTPException(status_code=400, detail="Client update payload required")

    if client_update.title is not None:
        dispute.title = client_update.title
    if client_update.description is not None:
        dispute.description = client_update.description

    db.commit()
    db.refresh(dispute)
    return dispute
