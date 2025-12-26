print("✅ LOADED disputes routes from:", __file__)

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import get_current_user
from app.models.user import UserRole

from .models import Dispute
from .schemas import DisputeCreate, DisputeOut, DisputeUpdate, DisputeAdminUpdate


router = APIRouter(prefix="/api/disputes", tags=["Disputes"])
admin_router = APIRouter(prefix="/api/admin/disputes", tags=["Admin Disputes"])


def _is_admin(user) -> bool:
    role = getattr(user, "role", None)
    # works for Enum or string
    if isinstance(role, UserRole):
        return role == UserRole.admin
    return str(role).lower() == "admin"


def _is_client(user) -> bool:
    role = getattr(user, "role", None)
    if isinstance(role, UserRole):
        return role == UserRole.client
    return str(role).lower() == "client"


def _get_dispute_or_404(db: Session, dispute_id: int) -> Dispute:
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    return dispute


@router.get("/ping")
def ping():
    return {"ok": True, "module": "disputes"}


# -------------------------
# CLIENT
# -------------------------

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


@router.get("/my", response_model=List[DisputeOut])
def list_my_disputes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not _is_client(current_user):
        raise HTTPException(status_code=403, detail="Only clients can view this list")

    return (
        db.query(Dispute)
        .filter(Dispute.client_id == current_user.id)
        .order_by(Dispute.id.desc())
        .all()
    )


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


@router.patch("/{dispute_id}", response_model=DisputeOut)
def client_update_dispute(
    dispute_id: int,
    payload: DisputeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    dispute = _get_dispute_or_404(db, dispute_id)

    if dispute.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to update this dispute")

    if str(dispute.status).upper() != "PENDING":
        raise HTTPException(status_code=400, detail="Only PENDING disputes can be updated by client")

    if payload.title is not None:
        dispute.title = payload.title
    if payload.description is not None:
        dispute.description = payload.description

    db.commit()
    db.refresh(dispute)
    return dispute


# -------------------------
# ADMIN
# -------------------------

@admin_router.get("", response_model=List[DisputeOut])
def admin_list_disputes(
    status: Optional[str] = Query(None, description="PENDING or RESOLVED"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not _is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin only")

    q = db.query(Dispute)
    if status:
        q = q.filter(Dispute.status == status.upper())

    return q.order_by(Dispute.id.desc()).all()


@admin_router.get("/{dispute_id}", response_model=DisputeOut)
def admin_get_dispute(
    dispute_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not _is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin only")
    return _get_dispute_or_404(db, dispute_id)


@admin_router.patch("/{dispute_id}/resolve", response_model=DisputeOut)
def admin_resolve_dispute(
    dispute_id: int,
    payload: DisputeAdminUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not _is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin only")

    if payload.status is None and payload.admin_note is None:
        raise HTTPException(status_code=400, detail="Admin update payload required")

    dispute = _get_dispute_or_404(db, dispute_id)

    if payload.status is not None:
        dispute.status = payload.status.upper()
    if payload.admin_note is not None:
        dispute.admin_note = payload.admin_note

    db.commit()
    db.refresh(dispute)
    return dispute
