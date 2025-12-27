# backend/app/modules/documents/service.py

import os
from uuid import uuid4
from typing import Optional

from fastapi import UploadFile
from sqlalchemy.orm import Session

from .model import Document  # ✅ correct import (module-local model)

UPLOAD_DIR = "uploads/documents"


def save_upload(file: UploadFile) -> str:
    """
    Saves an uploaded file to disk and returns the saved file path.
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[1]
    filename = f"{uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    # NOTE: This reads the whole file into memory; fine for small demo files.
    # For large files, you would stream in chunks.
    with open(path, "wb") as f:
        f.write(file.file.read())

    return path


def create_document(
    db: Session,
    booking_id: int,
    title: str,
    file_path: str,
) -> Document:
    """
    Creates a document DB record.
    """
    doc = Document(
        booking_id=booking_id,
        title=title,
        file_path=file_path,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def list_documents(db: Session, booking_id: Optional[int] = None):
    """
    Lists documents.
    - If booking_id is provided: returns documents for that booking
    - If booking_id is None: returns all documents (admin/dev convenience)
    """
    q = db.query(Document)
    if booking_id is not None:
        q = q.filter(Document.booking_id == booking_id)

    return q.order_by(Document.id.desc()).all()


def get_document(db: Session, doc_id: int) -> Optional[Document]:
    """
    Returns a single document by ID, or None.
    """
    return db.query(Document).filter(Document.id == doc_id).first()


def delete_document(db: Session, doc_id: int) -> bool:
    """
    Deletes a document record and its file from disk.
    Returns True if deleted, False if not found.
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        return False

    # Remove file from filesystem (best effort)
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except OSError:
            pass  # still delete DB record even if file removal fails

    db.delete(doc)
    db.commit()
    return True
