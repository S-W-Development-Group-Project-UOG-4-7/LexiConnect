# backend/app/modules/documents/routes.py

from typing import Optional, List

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.routers.auth import get_current_user
from app.modules.cases.models import Case
from app.models.booking import Booking

from .schema import DocumentOut, DocumentCommentOut, DocumentCommentCreate
from .service import (
    save_upload,
    create_document,
    create_document_for_case,
    list_documents,
    get_documents_by_case,
    get_document,
    list_document_comments,
    create_document_comment,
    get_document_comment_meta,
    delete_document,
    resolve_case_id_from_booking,
)

router = APIRouter(prefix="/api/documents", tags=["Documents"])


def _role_str(u: User) -> Optional[str]:
    role = getattr(u, "role", None)
    return str(getattr(role, "value", role) or "").lower() or None


def _is_admin(u: User) -> bool:
    return u.role == UserRole.admin


def _is_client(u: User) -> bool:
    return u.role == UserRole.client


def _is_lawyer(u: User) -> bool:
    return u.role == UserRole.lawyer


def _get_booking_or_404(db: Session, booking_id: int) -> Booking:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


def _booking_client_id(booking: Booking) -> Optional[int]:
    return getattr(booking, "client_id", None) or getattr(booking, "user_id", None)


def _booking_lawyer_id(booking: Booking) -> Optional[int]:
    return getattr(booking, "lawyer_id", None) or getattr(booking, "assigned_lawyer_id", None)


def _ensure_can_access_booking_docs(current_user: User, booking: Booking):
    if _is_admin(current_user):
        return

    if _is_client(current_user):
        if _booking_client_id(booking) != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")
        return

    if _is_lawyer(current_user):
        if _booking_lawyer_id(booking) != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")
        return

    raise HTTPException(status_code=403, detail="Not allowed")


def _can_access_case(user: User, case: Case, db: Session) -> bool:
    if _is_admin(user):
        return True

    if _is_client(user) and getattr(case, "client_id", None) == user.id:
        return True

    if _is_lawyer(user):
        linked = (
            db.query(Booking)
            .filter(Booking.case_id == case.id, Booking.lawyer_id == user.id)
            .first()
        )
        if linked:
            return True

    return False


def _attach_comment_meta(db: Session, docs: List):
    if not docs:
        return docs

    doc_ids = [d.id for d in docs]
    counts, latest = get_document_comment_meta(db, doc_ids)

    for d in docs:
        setattr(d, "comment_count", counts.get(d.id, 0))
        setattr(d, "latest_comment", latest.get(d.id))

    return docs


# -------------------------
# CASE routes MUST come first
# -------------------------
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

    docs = get_documents_by_case(db, case_id)
    return _attach_comment_meta(db, docs)


@router.post("/by-case/{case_id}", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def upload_case_document(
    case_id: int,
    file_name: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if not _can_access_case(current_user, case, db):
        raise HTTPException(status_code=403, detail="Not allowed")

    safe_title = (title or file_name or file.filename or "Untitled").strip()
    file_path = save_upload(file)

    doc = create_document_for_case(
        db,
        case_id=case_id,
        title=safe_title,
        file_path=file_path,
        uploaded_by_user_id=current_user.id,
        uploaded_by_role=_role_str(current_user),
        original_filename=file.filename or safe_title,
    )

    _attach_comment_meta(db, [doc])
    return doc


# -------------------------
# BOOKING upload/list
# -------------------------
@router.post("", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def upload_document(
    booking_id: int = Form(...),
    file_name: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = _get_booking_or_404(db, booking_id)
    _ensure_can_access_booking_docs(current_user, booking)

    safe_title = (title or file_name or file.filename or "Untitled").strip()
    file_path = save_upload(file)
    case_id = resolve_case_id_from_booking(db, booking_id)

    doc = create_document(
        db,
        booking_id=booking_id,
        case_id=case_id,
        uploaded_by_user_id=current_user.id,
        uploaded_by_role=_role_str(current_user),
        title=safe_title,
        original_filename=file.filename or safe_title,
        file_path=file_path,
    )

    _attach_comment_meta(db, [doc])
    return doc


@router.get("", response_model=List[DocumentOut])
def get_documents(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = _get_booking_or_404(db, booking_id)
    _ensure_can_access_booking_docs(current_user, booking)

    docs = list_documents(db, booking_id=booking_id)
    return _attach_comment_meta(db, docs)


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document_by_id(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    booking = _get_booking_or_404(db, doc.booking_id)
    _ensure_can_access_booking_docs(current_user, booking)

    _attach_comment_meta(db, [doc])
    return doc


@router.get("/{doc_id}/comments", response_model=List[DocumentCommentOut])
def get_document_comments(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    booking = _get_booking_or_404(db, doc.booking_id)
    _ensure_can_access_booking_docs(current_user, booking)

    return list_document_comments(db, doc_id)


@router.post("/{doc_id}/comments", response_model=DocumentCommentOut, status_code=status.HTTP_201_CREATED)
def create_doc_comment(
    doc_id: int,
    payload: DocumentCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    booking = _get_booking_or_404(db, doc.booking_id)
    _ensure_can_access_booking_docs(current_user, booking)

    if not (_is_admin(current_user) or _is_lawyer(current_user)):
        raise HTTPException(status_code=403, detail="Only lawyers or admins can comment")

    comment_text = (payload.comment_text or "").strip()
    if not comment_text:
        raise HTTPException(status_code=400, detail="Comment text is required")

    return create_document_comment(
        db=db,
        document_id=doc_id,
        comment_text=comment_text,
        created_by_user_id=current_user.id,
        created_by_role=_role_str(current_user),
    )


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document_by_id(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    booking = _get_booking_or_404(db, doc.booking_id)
    _ensure_can_access_booking_docs(current_user, booking)

    ok = delete_document(db, doc_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Document not found")
    return None
