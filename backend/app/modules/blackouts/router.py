"""Blackouts module (Vithana)

Endpoints (mounted by leader):
- POST   /api/blackouts
- GET    /api/blackouts/me
- DELETE /api/blackouts/{id}
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.modules.blackouts.schemas import BlackoutCreate, BlackoutOut
from app.modules.blackouts.service import create_blackout, delete_blackout, list_my_blackouts

router = APIRouter(prefix="/api/blackouts", tags=["blackouts"])


def _require_lawyer(current_user: User) -> None:
    if current_user.role != "lawyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lawyers can access this endpoint",
        )


@router.post("", response_model=BlackoutOut, status_code=status.HTTP_201_CREATED)
def create_my_blackout(
    payload: BlackoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    blackout = create_blackout(db, lawyer_id=current_user.id, payload=payload)
    return BlackoutOut.model_validate(blackout)


@router.get("/me", response_model=list[BlackoutOut])
def list_my_blackout_ranges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    blackouts = list_my_blackouts(db, lawyer_id=current_user.id)
    return [BlackoutOut.model_validate(b) for b in blackouts]


@router.delete("/{blackout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_blackout(
    blackout_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    delete_blackout(db, lawyer_id=current_user.id, blackout_id=blackout_id)
    return None
