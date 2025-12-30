# backend/app/modules/documents/routes.py
from fastapi import HTTPException, status
from app.models.appointment import Appointment, AppointmentStatus

from typing import Optional, List

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from .schema import DocumentOut
from .service import (
    save_upload,
    create_document,
    list_documents,
    get_document,
    delete_document,
)

router = APIRouter(prefix="/api/documents", tags=["Documents"])


@router.post("", response_model=DocumentOut)
def upload_document(
    booking_id: int = Form(...),
    file_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # 🔒 Backend guard: block uploads for CANCELLED appointments
    appt = db.query(Appointment).filter(Appointment.id == booking_id).first()

    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found."
        )

    if appt.status == AppointmentStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot upload documents for a cancelled booking."
        )

    # ✅ Only save file if appointment is valid
    file_path = save_upload(file)

    doc = create_document(
        db,
        booking_id=booking_id,
        title=file_name,
        original_filename=file.filename or file_name,
        file_path=file_path,
    )
    return doc



@router.get("", response_model=List[DocumentOut])
def get_documents(booking_id: Optional[int] = None, db: Session = Depends(get_db)):
    return list_documents(db, booking_id=booking_id)


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document_by_id(doc_id: int, db: Session = Depends(get_db)):
    doc = get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{doc_id}", status_code=204)
def delete_document_by_id(doc_id: int, db: Session = Depends(get_db)):
    ok = delete_document(db, doc_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Document not found")
    return None
