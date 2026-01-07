# backend/app/modules/case_files/router.py

from typing import List

from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.case_files.schemas import (
    CaseIntakeCreate,
    CaseIntakeOut,
    CaseIntakeUpdate,
    CaseDocumentOut,
    CaseChecklistOut,
    CaseChecklistIsCompleteOut,
)

from app.modules.case_files.service import CaseIntakeService, CaseDocumentsService, CaseChecklistService

router = APIRouter(tags=["Case Files"])


# ---------------------------
# Case Intake Endpoints
# ---------------------------
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


# ---------------------------
# Case Documents Endpoints
# ---------------------------
@router.post(
    "/cases/{case_id}/documents",
    response_model=CaseDocumentOut,
    status_code=status.HTTP_201_CREATED,
)
def upload_case_document(
    case_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # uploaded_by_user_id optional for now (can be wired later from auth)
    return CaseDocumentsService.upload_document(db=db, case_id=case_id, file=file)


@router.get("/cases/{case_id}/documents", response_model=List[CaseDocumentOut])
def list_case_documents(case_id: int, db: Session = Depends(get_db)):
    return CaseDocumentsService.list_documents(db=db, case_id=case_id)


@router.delete("/cases/{case_id}/documents/{doc_id}")
def delete_case_document(case_id: int, doc_id: int, db: Session = Depends(get_db)):
    CaseDocumentsService.delete_document(db=db, case_id=case_id, doc_id=doc_id)
    return {"detail": "Deleted"}

# ---------------------------
# Case Checklist Endpoints
# ---------------------------
@router.post("/cases/{case_id}/checklist/init", response_model=CaseChecklistOut, status_code=status.HTTP_201_CREATED)
def init_case_checklist(case_id: int, db: Session = Depends(get_db)):
    return CaseChecklistService.init_checklist(db=db, case_id=case_id)


@router.get("/cases/{case_id}/checklist", response_model=CaseChecklistOut)
def get_case_checklist(case_id: int, db: Session = Depends(get_db)):
    return CaseChecklistService.get_checklist(db=db, case_id=case_id)


@router.get("/cases/{case_id}/checklist/is-complete", response_model=CaseChecklistIsCompleteOut)
def is_case_checklist_complete(case_id: int, db: Session = Depends(get_db)):
    return {"case_id": case_id, "is_complete": CaseChecklistService.is_complete(db=db, case_id=case_id)}
