"""Availability module (Vithana)

Endpoints (mounted by leader):
- POST   /api/availability
- GET    /api/availability/me
- PATCH  /api/availability/{id}
- DELETE /api/availability/{id}
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.modules.availability.schemas import (
    AvailabilityTemplateCreate,
    AvailabilityTemplateOut,
    AvailabilityTemplateUpdate,
)
from app.modules.availability.service import (
    create_availability_template,
    delete_availability_template,
    list_my_availability,
    update_availability_template,
)

router = APIRouter(prefix="/api/availability", tags=["availability"])


def _require_lawyer(current_user: User) -> None:
    if hasattr(current_user, "role") and current_user.role != "lawyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lawyers can access this endpoint",
        )


@router.post("", response_model=AvailabilityTemplateOut, status_code=status.HTTP_201_CREATED)
def create_availability(
    payload: AvailabilityTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    template = create_availability_template(db, lawyer_id=current_user.id, payload=payload)
    return AvailabilityTemplateOut.model_validate(template)


@router.get("/me", response_model=list[AvailabilityTemplateOut])
def list_my_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    templates = list_my_availability(db, lawyer_id=current_user.id)
    return [AvailabilityTemplateOut.model_validate(t) for t in templates]


@router.patch("/{template_id}", response_model=AvailabilityTemplateOut)
def patch_template(
    template_id: uuid.UUID,
    payload: AvailabilityTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    template = update_availability_template(
        db,
        lawyer_id=current_user.id,
        template_id=template_id,
        payload=payload,
    )
    return AvailabilityTemplateOut.model_validate(template)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    delete_availability_template(db, lawyer_id=current_user.id, template_id=template_id)
    return None
