# backend/app/modules/case_files/service.py

from __future__ import annotations

import os
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.modules.case_files.models import CaseChecklist, CaseDocument, CaseIntake



# ---------------------------
# Case Intake Service
# ---------------------------
class CaseIntakeService:
    @staticmethod
    def get_intake(db: Session, case_id: int) -> CaseIntake:
        intake = db.query(CaseIntake).filter(CaseIntake.case_id == case_id).first()
        if not intake:
            raise HTTPException(status_code=404, detail="Case intake not found")
        return intake

    @staticmethod
    def create_intake(db: Session, case_id: int, payload) -> CaseIntake:
        existing = db.query(CaseIntake).filter(CaseIntake.case_id == case_id).first()
        if existing:
            raise HTTPException(status_code=409, detail="Case intake already exists")

        intake = CaseIntake(
            case_id=case_id,
            status=payload.status if payload.status is not None else "draft",
            answers_json=payload.answers_json,
        )
        db.add(intake)
        db.commit()
        db.refresh(intake)
        return intake

    @staticmethod
    def update_intake(db: Session, case_id: int, payload) -> CaseIntake:
        intake = db.query(CaseIntake).filter(CaseIntake.case_id == case_id).first()
        if not intake:
            raise HTTPException(status_code=404, detail="Case intake not found")

        if getattr(payload, "status", None) is not None:
            intake.status = payload.status

        if getattr(payload, "answers_json", None) is not None:
            intake.answers_json = payload.answers_json

        db.add(intake)
        db.commit()
        db.refresh(intake)
        return intake


# ---------------------------
# Case Documents Service
# ---------------------------
class CaseDocumentsService:
    """
    Stores files on disk and metadata in case_documents table.
    Storage base: uploads/case_documents/<case_id>/
    """

    BASE_DIR = Path("uploads") / "case_documents"

    @staticmethod
    def _ensure_case_dir(case_id: int) -> Path:
        case_dir = CaseDocumentsService.BASE_DIR / str(case_id)
        case_dir.mkdir(parents=True, exist_ok=True)
        return case_dir

    @staticmethod
    def _safe_filename(original_name: str) -> str:
        # keep extension if possible
        ext = ""
        if "." in original_name:
            ext = "." + original_name.split(".")[-1]
        return f"{uuid.uuid4().hex}{ext}"

    @staticmethod
    def upload_document(
        db: Session,
        case_id: int,
        file: UploadFile,
        uploaded_by_user_id: Optional[int] = None,
    ) -> CaseDocument:
        if file is None:
            raise HTTPException(status_code=400, detail="File is required")

        case_dir = CaseDocumentsService._ensure_case_dir(case_id)
        stored_name = CaseDocumentsService._safe_filename(file.filename or "file")
        stored_path = case_dir / stored_name

        # Save file to disk
        try:
            with open(stored_path, "wb") as f:
                f.write(file.file.read())
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

        doc = CaseDocument(
            case_id=case_id,
            filename=file.filename or stored_name,
            stored_path=str(stored_path).replace("\\", "/"),
            mime_type=file.content_type,
            size_bytes=os.path.getsize(stored_path),
            uploaded_by_user_id=uploaded_by_user_id,
        )

        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def list_documents(db: Session, case_id: int) -> List[CaseDocument]:
        return (
            db.query(CaseDocument)
            .filter(CaseDocument.case_id == case_id)
            .order_by(CaseDocument.uploaded_at.desc())
            .all()
        )

    @staticmethod
    def delete_document(db: Session, case_id: int, doc_id: int) -> None:
        doc = (
            db.query(CaseDocument)
            .filter(CaseDocument.id == doc_id, CaseDocument.case_id == case_id)
            .first()
        )
        if not doc:
            raise HTTPException(status_code=404, detail="Case document not found")

        # remove file if exists
        try:
            if doc.stored_path and os.path.exists(doc.stored_path):
                os.remove(doc.stored_path)
        except Exception:
            # don't block DB delete if file delete fails
            pass

        db.delete(doc)
        db.commit()

# ---------------------------
# Case Checklist Service
# ---------------------------
class CaseChecklistService:
    DEFAULT_ITEMS = [
        {"key": "intake_submitted", "label": "Case intake submitted", "done": False},
        {"key": "documents_uploaded", "label": "Required documents uploaded", "done": False},
        {"key": "lawyer_assigned", "label": "Lawyer assigned", "done": False},
        {"key": "hearing_scheduled", "label": "Hearing date scheduled", "done": False},
    ]

    @staticmethod
    def init_checklist(db: Session, case_id: int) -> CaseChecklist:
        existing = db.query(CaseChecklist).filter(CaseChecklist.case_id == case_id).first()
        if existing:
            return existing

        checklist = CaseChecklist(case_id=case_id, items_json=CaseChecklistService.DEFAULT_ITEMS)
        db.add(checklist)
        db.commit()
        db.refresh(checklist)
        return checklist

    @staticmethod
    def get_checklist(db: Session, case_id: int) -> CaseChecklist:
        checklist = db.query(CaseChecklist).filter(CaseChecklist.case_id == case_id).first()
        if not checklist:
            raise HTTPException(status_code=404, detail="Case checklist not found")
        return checklist

    @staticmethod
    def is_complete(db: Session, case_id: int) -> bool:
        checklist = CaseChecklistService.get_checklist(db=db, case_id=case_id)
        items = checklist.items_json or []
        return all(bool(item.get("done")) for item in items)
