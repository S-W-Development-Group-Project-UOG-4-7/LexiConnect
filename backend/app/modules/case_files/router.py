# backend/app/modules/case_files/router.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.case_files.schemas import CaseIntakeCreate, CaseIntakeOut, CaseIntakeUpdate
from app.modules.case_files.service import CaseIntakeService

router = APIRouter(tags=["Case Files"])


@router.get("/cases/{case_id}/intake", response_model=CaseIntakeOut)
def get_case_intake(case_id: int, db: Session = Depends(get_db)):
    return CaseIntakeService.get_intake(db=db, case_id=case_id)


@router.post(
    "/cases/{case_id}/intake",
    response_model=CaseIntakeOut,
    status_code=status.HTTP_201_CREATED,
)
def create_case_intake(case_id: int, payload: CaseIntakeCreate, db: Session = Depends(get_db)):
    return CaseIntakeService.create_intake(db=db, case_id=case_id, payload=payload)


@router.patch("/cases/{case_id}/intake", response_model=CaseIntakeOut)
def update_case_intake(case_id: int, payload: CaseIntakeUpdate, db: Session = Depends(get_db)):
    return CaseIntakeService.update_intake(db=db, case_id=case_id, payload=payload)
