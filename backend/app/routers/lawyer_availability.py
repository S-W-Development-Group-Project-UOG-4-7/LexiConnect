from datetime import date, time
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.lawyer_availability import WeeklyAvailability, WeekDay
from app.modules.blackouts.models import BlackoutDay
from app.models.branch import Branch
from app.routers.auth import get_current_user
from app.modules.branches.service import get_lawyer_by_user

# ---------------------------------------------------------------------------
# Canonical tables for availability in this phase:
# - weekly_availability: source of truth for recurring weekly schedule rows
# - blackout_days: source of truth for full-day blackouts
#
# Other availability tables (availability_templates, availability_slots,
# availability_exceptions, blackout_dates) are reserved for future features
# (templating/partial blocks). Do not use them in the current flow.
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/lawyer-availability", tags=["Lawyer Availability"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class WeeklyBase(BaseModel):
    day_of_week: str = Field(..., description="MONDAY..SUNDAY")
    start_time: time
    end_time: time
    branch_id: Optional[int] = None
    max_bookings: Optional[int] = None
    is_active: Optional[bool] = True

    @field_validator("day_of_week", mode="before")
    @classmethod
    def normalize_day(cls, v: str):
        if not isinstance(v, str):
            raise ValueError("day_of_week must be a string")
        upper = v.strip().upper()
        allowed = {
            "MONDAY": WeekDay.MONDAY,
            "TUESDAY": WeekDay.TUESDAY,
            "WEDNESDAY": WeekDay.WEDNESDAY,
            "THURSDAY": WeekDay.THURSDAY,
            "FRIDAY": WeekDay.FRIDAY,
            "SATURDAY": WeekDay.SATURDAY,
            "SUNDAY": WeekDay.SUNDAY,
        }
        if upper not in allowed:
            raise ValueError("day_of_week must be one of MONDAY..SUNDAY")
        return upper


class WeeklyCreate(WeeklyBase):
    pass


class WeeklyUpdate(BaseModel):
    day_of_week: Optional[str] = Field(None, description="MONDAY..SUNDAY")
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    branch_id: Optional[int] = None
    max_bookings: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("day_of_week", mode="before")
    @classmethod
    def normalize_day(cls, v):
        if v is None:
            return v
        return WeeklyBase.normalize_day(v)


class WeeklyOut(WeeklyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class BlackoutBase(BaseModel):
    date: date
    reason: Optional[str] = None


class BlackoutCreate(BlackoutBase):
    pass


class BlackoutOut(BlackoutBase):
    model_config = ConfigDict(from_attributes=True)

    id: str


class AvailabilityBundle(BaseModel):
    weekly: List[WeeklyOut]
    blackouts: List[BlackoutOut]
    branches: List[dict]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _require_lawyer(user: User):
    if user.role != UserRole.lawyer:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only lawyers can access this resource")


def _current_lawyer(db: Session, current_user: User):
    # Branches/weekly availability are keyed to the Lawyer table (FK)
    return get_lawyer_by_user(db, current_user.email)


def _to_weekday(day_str: str) -> WeekDay:
    mapping = {
        "MONDAY": WeekDay.MONDAY,
        "TUESDAY": WeekDay.TUESDAY,
        "WEDNESDAY": WeekDay.WEDNESDAY,
        "THURSDAY": WeekDay.THURSDAY,
        "FRIDAY": WeekDay.FRIDAY,
        "SATURDAY": WeekDay.SATURDAY,
        "SUNDAY": WeekDay.SUNDAY,
    }
    return mapping[day_str]


def _branch_for_lawyer(db: Session, branch_id: Optional[int], lawyer_id: int) -> Optional[Branch]:
    if branch_id is None:
        return None
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    if branch.lawyer_id and branch.lawyer_id != lawyer_id:
        raise HTTPException(status_code=403, detail="Branch does not belong to this lawyer")
    return branch


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@router.get("/me", response_model=AvailabilityBundle)
def get_my_availability(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    lawyer = _current_lawyer(db, current_user)

    weekly_rows = (
        db.query(WeeklyAvailability)
        .filter(WeeklyAvailability.lawyer_id == lawyer.id)
        .order_by(WeeklyAvailability.day_of_week, WeeklyAvailability.start_time)
        .all()
    )

    weekly = [
        WeeklyOut(
            id=row.id,
            day_of_week=row.day_of_week.name.upper(),
            start_time=row.start_time,
            end_time=row.end_time,
            branch_id=row.branch_id,
            max_bookings=row.max_bookings,
            is_active=row.is_active,
        )
        for row in weekly_rows
    ]

    blackout_rows = (
        db.query(BlackoutDay)
        .filter(BlackoutDay.lawyer_id == current_user.id)
        .order_by(BlackoutDay.date.desc())
        .all()
    )
    blackouts = [
        BlackoutOut(id=str(b.id), date=b.date, reason=b.reason) for b in blackout_rows
    ]

    branches = db.query(Branch).filter(Branch.lawyer_id == lawyer.id).all()
    branch_out = [
        {"id": b.id, "name": b.name, "district": b.district, "city": b.city} for b in branches
    ]

    return AvailabilityBundle(weekly=weekly, blackouts=blackouts, branches=branch_out)


@router.get("/weekly", response_model=List[WeeklyOut])
def list_weekly(
    lawyer_id: Optional[int] = Query(None, description="Compatibility param (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    lawyer = _current_lawyer(db, current_user)
    target_id = lawyer_id or lawyer.id
    if target_id != lawyer.id:
        raise HTTPException(status_code=403, detail="Cannot view another lawyer's availability")

    weekly_rows = (
        db.query(WeeklyAvailability)
        .filter(WeeklyAvailability.lawyer_id == target_id)
        .order_by(WeeklyAvailability.day_of_week, WeeklyAvailability.start_time)
        .all()
    )
    return [
        WeeklyOut(
            id=row.id,
            day_of_week=row.day_of_week.name.upper(),
            start_time=row.start_time,
            end_time=row.end_time,
            branch_id=row.branch_id,
            max_bookings=row.max_bookings,
            is_active=row.is_active,
        )
        for row in weekly_rows
    ]


@router.get("/branches", response_model=List[dict])
def list_branches(
    lawyer_id: Optional[int] = Query(None, description="Compatibility param (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    lawyer = _current_lawyer(db, current_user)
    target_id = lawyer_id or lawyer.id
    if target_id != lawyer.id:
        raise HTTPException(status_code=403, detail="Cannot view another lawyer's branches")
    branches = db.query(Branch).filter(Branch.lawyer_id == target_id).all()
    return [{"id": b.id, "name": b.name, "district": b.district, "city": b.city} for b in branches]


@router.get("/blackouts", response_model=List[BlackoutOut])
def list_blackouts(
    lawyer_id: Optional[int] = Query(None, description="Compatibility param (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    # BlackoutDay FK points to users.id
    target_id = lawyer_id or current_user.id
    if target_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot view another lawyer's blackouts")

    blackout_rows = (
        db.query(BlackoutDay)
        .filter(BlackoutDay.lawyer_id == target_id)
        .order_by(BlackoutDay.date.desc())
        .all()
    )
    return [BlackoutOut(id=str(b.id), date=b.date, reason=b.reason) for b in blackout_rows]


@router.post("/weekly", response_model=WeeklyOut, status_code=status.HTTP_201_CREATED)
def create_weekly_slot(
    payload: WeeklyCreate,
    lawyer_id: Optional[int] = Query(None, description="Compatibility param (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    lawyer = _current_lawyer(db, current_user)
    target_id = lawyer_id or lawyer.id
    if target_id != lawyer.id:
        raise HTTPException(status_code=403, detail="Cannot create availability for another lawyer")

    if payload.start_time >= payload.end_time:
        raise HTTPException(status_code=400, detail="start_time must be before end_time")

    _branch_for_lawyer(db, payload.branch_id, target_id)

    entry = WeeklyAvailability(
        lawyer_id=target_id,
        branch_id=payload.branch_id,
        day_of_week=_to_weekday(payload.day_of_week),
        start_time=payload.start_time,
        end_time=payload.end_time,
        max_bookings=payload.max_bookings,
        is_active=payload.is_active if payload.is_active is not None else True,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return WeeklyOut(
        id=entry.id,
        day_of_week=entry.day_of_week.name.upper(),
        start_time=entry.start_time,
        end_time=entry.end_time,
        branch_id=entry.branch_id,
        max_bookings=entry.max_bookings,
        is_active=entry.is_active,
    )


@router.patch("/weekly/{entry_id}", response_model=WeeklyOut)
def update_weekly_slot(
    entry_id: int,
    payload: WeeklyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    lawyer = _current_lawyer(db, current_user)
    entry = (
        db.query(WeeklyAvailability)
        .filter(WeeklyAvailability.id == entry_id, WeeklyAvailability.lawyer_id == lawyer.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Weekly availability not found")

    updates = payload.model_dump(exclude_unset=True)

    if "day_of_week" in updates:
        updates["day_of_week"] = _to_weekday(updates["day_of_week"])

    if "branch_id" in updates:
        _branch_for_lawyer(db, updates["branch_id"], lawyer.id)

    start_time = updates.get("start_time", entry.start_time)
    end_time = updates.get("end_time", entry.end_time)
    if start_time and end_time and start_time >= end_time:
        raise HTTPException(status_code=400, detail="start_time must be before end_time")

    for field, value in updates.items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)
    return WeeklyOut(
        id=entry.id,
        day_of_week=entry.day_of_week.name.upper(),
        start_time=entry.start_time,
        end_time=entry.end_time,
        branch_id=entry.branch_id,
        max_bookings=entry.max_bookings,
        is_active=entry.is_active,
    )


@router.delete("/weekly/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_weekly_slot(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    lawyer = _current_lawyer(db, current_user)
    entry = (
        db.query(WeeklyAvailability)
        .filter(WeeklyAvailability.id == entry_id, WeeklyAvailability.lawyer_id == lawyer.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Weekly availability not found")

    db.delete(entry)
    db.commit()
    return None


@router.post("/blackouts", response_model=BlackoutOut, status_code=status.HTTP_201_CREATED)
def create_blackout(
    payload: BlackoutCreate,
    lawyer_id: Optional[int] = Query(None, description="Compatibility param (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    target_id = lawyer_id or current_user.id
    if target_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot create blackout for another lawyer")

    # prevent duplicate date per lawyer
    existing = (
        db.query(BlackoutDay)
        .filter(BlackoutDay.lawyer_id == target_id, BlackoutDay.date == payload.date)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Blackout for this date already exists")

    entry = BlackoutDay(
        lawyer_id=target_id,
        date=payload.date,
        reason=payload.reason,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return BlackoutOut(id=str(entry.id), date=entry.date, reason=entry.reason)


@router.delete("/blackouts/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blackout(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_lawyer(current_user)
    entry = (
        db.query(BlackoutDay)
        .filter(BlackoutDay.id == entry_id, BlackoutDay.lawyer_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Blackout not found")

    db.delete(entry)
    db.commit()
    return None


# Compatibility endpoints (legacy naming)
@router.get("/blackout", response_model=List[BlackoutOut])
def list_blackouts_legacy(
    lawyer_id: Optional[int] = Query(None, description="Compatibility param (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_blackouts(lawyer_id, db, current_user)


@router.post("/blackout", response_model=BlackoutOut, status_code=status.HTTP_201_CREATED)
def create_blackout_legacy(
    payload: BlackoutCreate,
    lawyer_id: Optional[int] = Query(None, description="Compatibility param (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_blackout(payload, lawyer_id, db, current_user)


@router.delete("/blackout/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blackout_legacy(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_blackout(entry_id, db, current_user)
