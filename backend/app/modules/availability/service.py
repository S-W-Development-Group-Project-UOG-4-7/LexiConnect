from datetime import date, datetime, time, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.modules.availability.models import AvailabilityTemplate
from app.modules.availability.schemas import (
    AvailabilityTemplateCreate,
    AvailabilityTemplateUpdate,
)
from app.models.booking import Booking
from app.models.branch import Branch
from app.models.lawyer_availability import WeeklyAvailability
from app.models.service_package import ServicePackage


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


def _time_to_minutes(value: time) -> int:
    return value.hour * 60 + value.minute


def _minutes_to_time_str(value: int) -> str:
    hours = (value // 60) % 24
    minutes = value % 60
    return f"{hours:02d}:{minutes:02d}"


ACTIVE_BOOKING_STATUSES = {"pending", "confirmed", "approved", "in_progress"}


def _build_busy_map(
    db: Session,
    *,
    lawyer_id: int,
    start_date: date,
    end_date: date,
    fallback_duration: int,
    branch_id: int | None = None,
) -> dict[str, list[tuple[int, int]]]:
    start_dt = datetime.combine(start_date, time.min)
    end_dt = datetime.combine(end_date, time.max)

    rows = (
        db.query(Booking, ServicePackage.duration)
        .outerjoin(ServicePackage, Booking.service_package_id == ServicePackage.id)
        .filter(
            Booking.lawyer_id == lawyer_id,
            Booking.scheduled_at.isnot(None),
            Booking.scheduled_at >= start_dt,
            Booking.scheduled_at <= end_dt,
            func.lower(Booking.status).in_(list(ACTIVE_BOOKING_STATUSES)),
        )
        .all()
    )

    busy_by_date: dict[str, list[tuple[int, int, int | None]]] = {}
    for booking, duration in rows:
        scheduled = booking.scheduled_at
        if scheduled is None:
            continue
        if branch_id is not None and booking.branch_id != branch_id:
            continue
        minutes = int(duration) if duration is not None else fallback_duration
        if minutes <= 0:
            minutes = fallback_duration

        start_min = scheduled.hour * 60 + scheduled.minute
        end_min = start_min + minutes
        key = scheduled.date().isoformat()
        busy_by_date.setdefault(key, []).append((start_min, end_min, booking.branch_id))

    return busy_by_date


def get_bookable_slots(
    db: Session,
    *,
    lawyer_id: int,
    date_from: date,
    days: int,
    duration_minutes: int,
    branch_id: int | None = None,
) -> list[dict]:
    if days < 1 or days > 31:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="days must be 1-31")
    if duration_minutes < 5 or duration_minutes > 240:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="duration_minutes must be between 5 and 240",
        )
    end_date = date_from + timedelta(days=days - 1)

    weekly_rows = (
        db.query(WeeklyAvailability)
        .filter(WeeklyAvailability.user_id == lawyer_id, WeeklyAvailability.is_active.is_(True))
        .all()
    )
    weekly_by_day: dict[str, list[WeeklyAvailability]] = {}
    for row in weekly_rows:
        key = row.day_of_week.name.upper()
        weekly_by_day.setdefault(key, []).append(row)

    branch_query = db.query(Branch).filter(Branch.user_id == lawyer_id)
    if branch_id is not None:
        branch_query = branch_query.filter(Branch.id == branch_id)
    branch_map = {b.id: b for b in branch_query.all()}

    busy_by_date = _build_busy_map(
        db,
        lawyer_id=lawyer_id,
        start_date=date_from,
        end_date=end_date,
        fallback_duration=duration_minutes,
        branch_id=branch_id,
    )

    results: list[dict] = []
    current = date_from
    while current <= end_date:
        day_key = current.strftime("%A").upper()
        slots = []
        for row in weekly_by_day.get(day_key, []):
            if branch_id is not None and row.branch_id != branch_id:
                continue
            start_min = _time_to_minutes(row.start_time)
            end_min = _time_to_minutes(row.end_time)
            if end_min <= start_min:
                continue

            busy_list = busy_by_date.get(current.isoformat(), [])
            window_busy = [
                (busy_start, busy_end)
                for busy_start, busy_end, busy_branch_id in busy_list
                if (busy_branch_id == row.branch_id or (busy_branch_id is None and row.branch_id is None))
                and busy_start < end_min
                and busy_end > start_min
            ]

            next_start = max((end for _, end in window_busy), default=start_min)
            slot_end = next_start + duration_minutes
            if slot_end <= end_min:
                branch = branch_map.get(row.branch_id)
                slots.append(
                    {
                        "start_time": _minutes_to_time_str(next_start),
                        "end_time": _minutes_to_time_str(slot_end),
                        "branch_id": row.branch_id,
                        "branch_name": branch.name if branch else None,
                        "duration_minutes": duration_minutes,
                    }
                )

        slots.sort(key=lambda s: s["start_time"])
        results.append({"date": current.isoformat(), "slots": slots})
        current += timedelta(days=1)

    return results
