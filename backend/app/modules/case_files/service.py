# backend/app/modules/case_files/service.py

from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.case_files.models import CaseIntake


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

        # Update only fields provided
        if getattr(payload, "status", None) is not None:
            intake.status = payload.status

        if getattr(payload, "answers_json", None) is not None:
            intake.answers_json = payload.answers_json

        db.add(intake)
        db.commit()
        db.refresh(intake)
        return intake
