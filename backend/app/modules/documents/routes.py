# backend/app/modules/documents/routes.py
from fastapi import HTTPException, status
from app.models.appointment import Appointment, AppointmentStatus

from typing import Optional, List

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.routers.auth import get_current_user
from app.modules.cases.models import Case
from app.models.booking import Booking
from .schema import DocumentOut
from .service import (
    save_upload,
    create_document,
    create_document_for_case,
    list_documents,
    get_documents_by_case,
    get_document,
    delete_document,
    resolve_case_id_from_booking,
)

router = APIRouter(prefix="/api/documents", tags=["Documents"])


@router.post("", response_model=DocumentOut)
def upload_document(
    booking_id: int = Form(...),
    file_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # simple ownership check: client owns booking or lawyer is assigned
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role == UserRole.client and booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    if current_user.role == UserRole.lawyer and booking.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    file_path = save_upload(file)
    doc = create_document(
        db,
        booking_id=booking_id,
        case_id=resolve_case_id_from_booking(db, booking_id),
        title=file_name,
        original_filename=file.filename or file_name,
        file_path=file_path,
    )
    # ensure case_id stored if resolvable
    case_id = resolve_case_id_from_booking(db, booking_id)
    if case_id is not None and doc.case_id != case_id:
        doc.case_id = case_id
        db.commit()
        db.refresh(doc)
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


def _can_access_case(user: User, case: Case, db: Session) -> bool:
    if user.role == UserRole.client and case.client_id == user.id:
        return True
    if user.role == UserRole.lawyer:
        linked = (
            db.query(Booking)
            .filter(Booking.case_id == case.id, Booking.lawyer_id == user.id)
            .first()
        )
        if linked:
            return True
    return False


@router.get("/by-case/{case_id}", response_model=List[DocumentOut])
def list_case_documents(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if not _can_access_case(current_user, case, db):
        raise HTTPException(status_code=403, detail="Not allowed")
    return get_documents_by_case(db, case_id)


@router.post("/by-case/{case_id}", response_model=DocumentOut)
def upload_case_document(
    case_id: int,
    file_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if not _can_access_case(current_user, case, db):
        raise HTTPException(status_code=403, detail="Not allowed")

    file_path = save_upload(file)
    doc = create_document_for_case(
        db,
        case_id=case_id,
        title=file_name,
        file_path=file_path,
    )
    return doc
