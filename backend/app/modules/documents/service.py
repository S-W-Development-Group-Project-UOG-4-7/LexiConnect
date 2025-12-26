import os
from uuid import uuid4
from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.models.document import Document



UPLOAD_DIR = "uploads/documents"

def save_upload(file: UploadFile) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1]
    filename = f"{uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(file.file.read())

    return path

def create_document(db: Session, booking_id: int, title: str, file_path: str) -> Document:
    doc = Document(booking_id=booking_id, title=title, file_path=file_path)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

def list_documents(db: Session, booking_id: int):
    return db.query(Document).filter(Document.booking_id == booking_id).order_by(Document.id.desc()).all()

def get_document(db: Session, doc_id: int):
    return db.query(Document).filter(Document.id == doc_id).first()
