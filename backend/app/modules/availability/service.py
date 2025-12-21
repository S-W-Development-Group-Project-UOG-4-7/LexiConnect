from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.availability.models import AvailabilityTemplate
from app.modules.availability.schemas import (
    AvailabilityTemplateCreate,
    AvailabilityTemplateUpdate,
)


def _validate_time_range(start_time, end_time) -> None:
    if start_time >= end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_time must be before end_time",
        )


def _validate_slot_minutes(slot_minutes: int) -> None:
    if slot_minutes < 5 or slot_minutes > 240:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="slot_minutes must be between 5 and 240",
        )


def _ensure_no_overlap(
    db: Session,
    *,
    lawyer_id: int,
    day_of_week: int,
    start_time,
    end_time,
    exclude_id=None,
) -> None:
    stmt = (
        select(AvailabilityTemplate.id)
        .where(
            AvailabilityTemplate.lawyer_id == lawyer_id,
            AvailabilityTemplate.day_of_week == day_of_week,
            AvailabilityTemplate.is_active.is_(True),
            AvailabilityTemplate.start_time < end_time,
            AvailabilityTemplate.end_time > start_time,
        )
        .limit(1)
    )

    if exclude_id is not None:
        stmt = stmt.where(AvailabilityTemplate.id != exclude_id)

    clash_id = db.execute(stmt).scalar_one_or_none()
    if clash_id is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Availability overlaps with an existing template",
        )


def create_availability_template(
    db: Session,
    *,
    lawyer_id: int,
    payload: AvailabilityTemplateCreate,
) -> AvailabilityTemplate:
    _validate_time_range(payload.start_time, payload.end_time)
    _validate_slot_minutes(payload.slot_minutes)

    if payload.is_active:
        _ensure_no_overlap(
            db,
            lawyer_id=lawyer_id,
            day_of_week=payload.day_of_week,
            start_time=payload.start_time,
            end_time=payload.end_time,
        )

    template = AvailabilityTemplate(
        lawyer_id=lawyer_id,
        day_of_week=payload.day_of_week,
        start_time=payload.start_time,
        end_time=payload.end_time,
        slot_minutes=payload.slot_minutes,
        is_active=payload.is_active,
    )

    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def list_my_availability(db: Session, *, lawyer_id: int) -> list[AvailabilityTemplate]:
    stmt = (
        select(AvailabilityTemplate)
        .where(AvailabilityTemplate.lawyer_id == lawyer_id)
        .order_by(AvailabilityTemplate.day_of_week.asc(), AvailabilityTemplate.start_time.asc())
    )
    return list(db.execute(stmt).scalars().all())


def update_availability_template(
    db: Session,
    *,
    lawyer_id: int,
    template_id,
    payload: AvailabilityTemplateUpdate,
) -> AvailabilityTemplate:
    template = db.get(AvailabilityTemplate, template_id)
    if template is None or template.lawyer_id != lawyer_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Availability not found")

    new_day_of_week = payload.day_of_week if payload.day_of_week is not None else template.day_of_week
    new_start_time = payload.start_time if payload.start_time is not None else template.start_time
    new_end_time = payload.end_time if payload.end_time is not None else template.end_time
    new_slot_minutes = payload.slot_minutes if payload.slot_minutes is not None else template.slot_minutes
    new_is_active = payload.is_active if payload.is_active is not None else template.is_active

    _validate_time_range(new_start_time, new_end_time)
    _validate_slot_minutes(new_slot_minutes)

    if new_is_active:
        _ensure_no_overlap(
            db,
            lawyer_id=lawyer_id,
            day_of_week=new_day_of_week,
            start_time=new_start_time,
            end_time=new_end_time,
            exclude_id=template.id,
        )

    template.day_of_week = new_day_of_week
    template.start_time = new_start_time
    template.end_time = new_end_time
    template.slot_minutes = new_slot_minutes
    template.is_active = new_is_active

    db.commit()
    db.refresh(template)
    return template


def delete_availability_template(db: Session, *, lawyer_id: int, template_id) -> None:
    template = db.get(AvailabilityTemplate, template_id)
    if template is None or template.lawyer_id != lawyer_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Availability not found")

    db.delete(template)
    db.commit()
