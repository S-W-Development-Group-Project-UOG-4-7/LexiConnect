from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from . import service
from .schemas import (
    AssignApprenticeRequest,
    CaseApprenticeOut,
    ApprenticeNoteCreate,
    ApprenticeNoteOut,
)

from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter(prefix="/apprenticeship", tags=["Apprenticeship"])


@router.post("/assign", response_model=CaseApprenticeOut)
def assign_apprentice(
    payload: AssignApprenticeRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return service.assign_apprentice(db, user, payload.case_id, payload.apprentice_id)


@router.get("/my/cases", response_model=List[CaseApprenticeOut])
def my_cases(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return service.get_my_assigned_cases(db, user)


@router.post("/cases/{case_id}/notes", response_model=ApprenticeNoteOut)
def add_case_note(
    case_id: int,
    payload: ApprenticeNoteCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return service.add_note(db, user, case_id, payload.note)


@router.get("/cases/{case_id}/notes", response_model=List[ApprenticeNoteOut])
def get_case_notes(
    case_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return service.get_case_notes_for_lawyer(db, user, case_id)
