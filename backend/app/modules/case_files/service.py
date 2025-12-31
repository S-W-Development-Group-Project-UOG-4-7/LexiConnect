import os
from typing import List, Optional, Tuple
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from .models import CaseDocument


UPLOAD_DIR = "uploads/documents"


def _ensure_upload_dir() -> None:
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_upload(file: UploadFile) -> Tuple[str, str, int, str]:
    _ensure_upload_dir()

    ext = os.path.splitext(file.filename or "")[1]
    stored_name = f"{uuid4().hex}{ext}"
    stored_path = os.path.join(UPLOAD_DIR, stored_name)

    content = file.file.read()
    with open(stored_path, "wb") as f:
        f.write(content)

    size_bytes = len(content)
    mime_type = file.content_type or "application/octet-stream"

    return stored_path, mime_type, size_bytes, stored_name


def create_case_document(
    db: Session,
    case_id: int,
    file: UploadFile,
    doc_type: Optional[str] = None,
    uploaded_by_user_id: Optional[int] = None,
) -> CaseDocument:
    stored_path, mime_type, size_bytes, stored_name = save_upload(file)

    doc = CaseDocument(
        case_id=case_id,
        filename=file.filename or stored_name,
        stored_path=stored_path,
        mime_type=mime_type,
        size_bytes=size_bytes,
        uploaded_by_user_id=uploaded_by_user_id,
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def list_case_documents(db: Session, case_id: int) -> List[CaseDocument]:
    return (
        db.query(CaseDocument)
        .filter(CaseDocument.case_id == case_id)
        .order_by(CaseDocument.uploaded_at.desc(), CaseDocument.id.desc())
        .all()
    )


def get_case_document(db: Session, case_id: int, doc_id: int) -> Optional[CaseDocument]:
    return (
        db.query(CaseDocument)
        .filter(CaseDocument.id == doc_id, CaseDocument.case_id == case_id)
        .first()
    )


def delete_case_document(db: Session, case_id: int, doc_id: int) -> bool:
    doc = get_case_document(db, case_id, doc_id)
    if not doc:
        return False

    try:
        if doc.stored_path and os.path.exists(doc.stored_path):
            os.remove(doc.stored_path)
    except OSError:
        pass

    db.delete(doc)
    db.commit()
    return True
