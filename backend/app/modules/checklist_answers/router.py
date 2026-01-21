from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.booking_checklist_answer import BookingChecklistAnswer
from app.models.booking import Booking
from app.models.checklist_template import ChecklistTemplate
from app.modules.cases.models import Case
from app.modules.checklist_answers.schemas import (
    ChecklistAnswerUpdate,
    ChecklistAnswerUpdateResponse,
    BookingChecklistAnswersResponse,
    ChecklistItemOut,
    ChecklistMissingItem,
)

router = APIRouter(prefix="/api/cases", tags=["Checklist Answers"])
booking_checklist_router = APIRouter(prefix="/api/checklist-answers", tags=["Checklist Answers"])


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


def _answer_is_checked(answer: BookingChecklistAnswer | None) -> bool:
    if not answer:
        return False
    if answer.document_id:
        return True
    if not answer.answer_text:
        return False
    normalized = answer.answer_text.strip().lower()
    if normalized in {"false", "no", "0", "unchecked"}:
        return False
    if normalized in {"true", "yes", "1", "checked", "done"}:
        return True
    return True


@booking_checklist_router.get("", response_model=BookingChecklistAnswersResponse)
def get_booking_checklist_answers(
    booking_id: int = Query(..., description="Booking ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role != "client" or booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    if not booking.service_package_id:
        return {
            "booking_id": booking.id,
            "case_id": booking.case_id,
            "service_package_id": booking.service_package_id,
            "total_items": 0,
            "completed_items": 0,
            "items": [],
            "missing_required": [],
        }

    templates = (
        db.query(ChecklistTemplate)
        .filter(
            or_(
                ChecklistTemplate.service_package_id == booking.service_package_id,
                ChecklistTemplate.service_package_id.is_(None),
            )
        )
        .order_by(ChecklistTemplate.id.asc())
        .all()
    )

    template_ids = [t.id for t in templates]
    answers = []
    if template_ids:
        answers = (
            db.query(BookingChecklistAnswer)
            .filter(
                BookingChecklistAnswer.booking_id == booking.id,
                BookingChecklistAnswer.template_id.in_(template_ids),
            )
            .all()
        )

    answer_map = {a.template_id: a for a in answers}
    items: list[ChecklistItemOut] = []
    missing_required: list[ChecklistMissingItem] = []
    completed_items = 0

    for t in templates:
        ans = answer_map.get(t.id)
        checked = _answer_is_checked(ans)
        if checked:
            completed_items += 1
        if t.required and not checked:
            missing_required.append(
                ChecklistMissingItem(
                    id=t.id,
                    title=t.question,
                    description=t.helper_text,
                )
            )

        items.append(
            ChecklistItemOut(
                template_id=t.id,
                title=t.question,
                description=t.helper_text,
                required=bool(t.required),
                checked=checked,
                answer_text=ans.answer_text if ans else None,
                document_id=ans.document_id if ans else None,
            )
        )

    return {
        "booking_id": booking.id,
        "case_id": booking.case_id,
        "service_package_id": booking.service_package_id,
        "total_items": len(templates),
        "completed_items": completed_items,
        "items": items,
        "missing_required": missing_required,
    }


@booking_checklist_router.post("", response_model=ChecklistAnswerUpdateResponse, status_code=status.HTTP_200_OK)
@booking_checklist_router.put("", response_model=ChecklistAnswerUpdateResponse, status_code=status.HTTP_200_OK)
def upsert_booking_checklist_answer(
    payload: ChecklistAnswerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role != "client" or booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    template = (
        db.query(ChecklistTemplate)
        .filter(ChecklistTemplate.id == payload.template_id)
        .first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="Checklist template not found")

    if (
        template.service_package_id is not None
        and booking.service_package_id != template.service_package_id
    ):
        raise HTTPException(status_code=422, detail="Template does not belong to this booking")

    row = (
        db.query(BookingChecklistAnswer)
        .filter(
            BookingChecklistAnswer.booking_id == booking.id,
            BookingChecklistAnswer.template_id == template.id,
        )
        .first()
    )

    answer_text = "true" if payload.checked else None
    if row:
        row.answer_text = answer_text
        row.document_id = None
        row.case_id = booking.case_id
        db.commit()
        db.refresh(row)
        return {
            "booking_id": booking.id,
            "template_id": template.id,
            "checked": payload.checked,
            "answer_text": row.answer_text,
            "document_id": row.document_id,
            "case_id": row.case_id,
        }

    if not payload.checked:
        return {
            "booking_id": booking.id,
            "template_id": template.id,
            "checked": False,
            "answer_text": None,
            "document_id": None,
            "case_id": booking.case_id,
        }

    row = BookingChecklistAnswer(
        booking_id=booking.id,
        template_id=template.id,
        answer_text=answer_text,
        document_id=None,
        case_id=booking.case_id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return {
        "booking_id": booking.id,
        "template_id": template.id,
        "checked": payload.checked,
        "answer_text": row.answer_text,
        "document_id": row.document_id,
        "case_id": row.case_id,
    }
