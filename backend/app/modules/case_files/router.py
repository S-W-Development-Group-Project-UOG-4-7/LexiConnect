from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from .schemas import CaseDocumentOut
from .service import create_case_document, list_case_documents, delete_case_document


router = APIRouter(prefix="/api/cases/{case_id}/documents", tags=["Case Files"])


@router.post("", response_model=CaseDocumentOut)
def upload_case_document(
    case_id: int,
    file: UploadFile = File(...),
    doc_type: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    doc = create_case_document(db, case_id=case_id, file=file, doc_type=doc_type)
    return doc


@router.get("", response_model=List[CaseDocumentOut])
def get_case_documents(case_id: int, db: Session = Depends(get_db)):
    return list_case_documents(db, case_id=case_id)


@router.delete("/{doc_id}", status_code=204)
def delete_case_document_endpoint(case_id: int, doc_id: int, db: Session = Depends(get_db)):
    ok = delete_case_document(db, case_id=case_id, doc_id=doc_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Document not found")
    return None
