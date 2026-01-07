from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.booking_checklist_answer import BookingChecklistAnswer
from app.modules.cases.models import Case

router = APIRouter(prefix="/api/cases", tags=["Checklist Answers"])


class ChecklistAnswerUpsert(BaseModel):
    template_id: int
    answer_text: str | None = None
    document_id: int | None = None


@router.get("/{case_id}/checklist/answers")
def get_case_checklist_answers(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if current_user.role != "client" or case.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    rows = (
        db.query(BookingChecklistAnswer)
        .filter(BookingChecklistAnswer.case_id == case_id)
        .all()
    )

    return [
        {
            "id": r.id,
            "template_id": r.template_id,
            "answer_text": r.answer_text,
            "document_id": r.document_id,
            "case_id": r.case_id,
        }
        for r in rows
    ]


@router.post("/{case_id}/checklist/answers")
def upsert_case_checklist_answer(
    case_id: int,
    payload: ChecklistAnswerUpsert,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if current_user.role != "client" or case.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    # must provide either answer_text or document_id
    has_text = payload.answer_text is not None and payload.answer_text.strip() != ""
    has_doc = payload.document_id is not None
    if not (has_text or has_doc):
        raise HTTPException(status_code=422, detail="answer_text or document_id required")

    row = (
        db.query(BookingChecklistAnswer)
        .filter(
            and_(
                BookingChecklistAnswer.case_id == case_id,
                BookingChecklistAnswer.template_id == payload.template_id,
            )
        )
        .first()
    )

    if row:
        row.answer_text = payload.answer_text
        row.document_id = payload.document_id
    else:
        # booking_id is NOT required for case-level answers; set a dummy booking_id?
        # Your table has booking_id NOT NULL, so we must attach to an existing booking under this case.
        # We will pick latest booking id for this case.
        from app.models.booking import Booking

        latest_booking = (
            db.query(Booking)
            .filter(Booking.case_id == case_id)
            .order_by(Booking.id.desc())
            .first()
        )
        if not latest_booking:
            raise HTTPException(status_code=422, detail="Create a booking draft first (no booking found for case)")

        row = BookingChecklistAnswer(
            booking_id=latest_booking.id,
            template_id=payload.template_id,
            answer_text=payload.answer_text,
            document_id=payload.document_id,
            case_id=case_id,
        )
        db.add(row)

    db.commit()
    db.refresh(row)

    return {
        "id": row.id,
        "template_id": row.template_id,
        "answer_text": row.answer_text,
        "document_id": row.document_id,
        "case_id": row.case_id,
    }
