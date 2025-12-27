from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.checklist_template import ChecklistTemplate

from app.modules.checklist_templates.schemas import (
    ChecklistTemplateCreate,
    ChecklistTemplateUpdate,
    ChecklistTemplateResponse,
)
from app.modules.checklist_templates import service


router = APIRouter(prefix="/api/checklist-templates", tags=["Checklist Templates"])


@router.post("", response_model=ChecklistTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_checklist_template(
    payload: ChecklistTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can create checklist templates")

    lawyer = service.get_lawyer_by_user(db, current_user.email)
    return service.create_template(db, lawyer, payload)


@router.get("/me", response_model=List[ChecklistTemplateResponse])
def get_my_checklist_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can view checklist templates")

    lawyer = service.get_lawyer_by_user(db, current_user.email)
    return service.get_my_templates(db, lawyer)


@router.patch("/{template_id}", response_model=ChecklistTemplateResponse)
def update_checklist_template(
    template_id: int,
    payload: ChecklistTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lawyer = service.get_lawyer_by_user(db, current_user.email)

    template = (
        db.query(ChecklistTemplate)
        .filter(ChecklistTemplate.id == template_id, ChecklistTemplate.lawyer_id == lawyer.id)
        .first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="Checklist template not found")

    return service.update_template(db, template, payload)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_checklist_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lawyer = service.get_lawyer_by_user(db, current_user.email)

    template = (
        db.query(ChecklistTemplate)
        .filter(ChecklistTemplate.id == template_id, ChecklistTemplate.lawyer_id == lawyer.id)
        .first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="Checklist template not found")

    service.delete_template(db, template)
