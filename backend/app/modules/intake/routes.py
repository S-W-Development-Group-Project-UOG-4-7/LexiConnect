from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.user import UserRole
from app.routers.auth import get_current_user
from app.modules.cases.models import Case

from app.modules.intake.models import IntakeForm
from app.modules.intake.schemas import IntakeCreate, IntakeUpdate, IntakeOut

router = APIRouter(prefix="/api/intake", tags=["Intake"])


def _role_str(user) -> str:
    role = getattr(user, "role", None)
    if isinstance(role, UserRole):
        return str(getattr(role, "value", role)).lower()
    return str(role or "").lower()


def _is_admin(user) -> bool:
    return _role_str(user) == "admin"


def _is_client(user) -> bool:
    return _role_str(user) == "client"


def _is_lawyer(user) -> bool:
    return _role_str(user) == "lawyer"


def _get_booking_or_404(db: Session, booking_id: int) -> Booking:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


def _booking_client_id(booking: Booking) -> Optional[int]:
    return getattr(booking, "client_id", None) or getattr(booking, "user_id", None)


def _booking_lawyer_id(booking: Booking) -> Optional[int]:
    return getattr(booking, "lawyer_id", None) or getattr(booking, "assigned_lawyer_id", None)


def _ensure_can_view_intake(current_user, booking: Booking):
    booking_client_id = _booking_client_id(booking)
    booking_lawyer_id = _booking_lawyer_id(booking)

    allowed = False
    if _is_admin(current_user):
        allowed = True
    elif _is_client(current_user) and booking_client_id == current_user.id:
        allowed = True
    elif _is_lawyer(current_user) and booking_lawyer_id == current_user.id:
        allowed = True

    if not allowed:
        raise HTTPException(status_code=403, detail="Not allowed to view this intake")


def _ensure_can_edit_intake(current_user, booking: Booking):
    booking_client_id = _booking_client_id(booking)

    if _is_admin(current_user):
        return
    if _is_client(current_user) and booking_client_id == current_user.id:
        return

    raise HTTPException(status_code=403, detail="Not allowed to modify this intake")


# -------------------------
# CREATE (booking-based)
# -------------------------

@router.post("", response_model=IntakeOut, status_code=status.HTTP_201_CREATED)
def create_intake_form(
    payload: IntakeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not _is_client(current_user):
        raise HTTPException(status_code=403, detail="Only clients can submit intake forms")

    booking = _get_booking_or_404(db, payload.booking_id)

    booking_client_id = _booking_client_id(booking)
    if booking_client_id is None:
        raise HTTPException(
            status_code=400,
            detail="Booking is missing a client identifier.",
        )

    if booking_client_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only submit intake for your own booking")

    existing = db.query(IntakeForm).filter(IntakeForm.booking_id == payload.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Intake already submitted for this booking")

    intake = IntakeForm(
        booking_id=payload.booking_id,
        case_id=getattr(booking, "case_id", None),
        client_id=current_user.id,
        case_type=payload.case_type,
        subject=payload.subject,
        details=payload.details,
        urgency=payload.urgency,
        answers_json=payload.extra_answers or {},
    )

    db.add(intake)
    db.commit()
    db.refresh(intake)
    return intake


# -------------------------
# READ (by booking)
# -------------------------

@router.get("/by-booking/{booking_id}", response_model=IntakeOut)
def get_intake_by_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    booking = _get_booking_or_404(db, booking_id)
    _ensure_can_view_intake(current_user, booking)

    intake = (
        db.query(IntakeForm)
        .filter(IntakeForm.booking_id == booking_id)
        .order_by(IntakeForm.id.desc())
        .first()
    )
    if not intake:
        raise HTTPException(status_code=404, detail="Intake form not found")

    return intake


@router.get("", response_model=IntakeOut, include_in_schema=False)
def get_intake_by_booking_query(
    booking_id: int = Query(..., gt=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_intake_by_booking(
        booking_id=booking_id,
        db=db,
        current_user=current_user,
    )


# -------------------------
# UPDATE by intake_id
# -------------------------

@router.put("/{intake_id}", response_model=IntakeOut)
def update_intake_form(
    intake_id: int,
    payload: IntakeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    intake = db.query(IntakeForm).filter(IntakeForm.id == intake_id).first()
    if not intake:
        raise HTTPException(status_code=404, detail="Intake not found")

    booking = _get_booking_or_404(db, intake.booking_id)
    _ensure_can_edit_intake(current_user, booking)

    if payload.case_type is not None:
        intake.case_type = payload.case_type
    if payload.subject is not None:
        intake.subject = payload.subject
    if payload.details is not None:
        intake.details = payload.details
    if payload.urgency is not None:
        intake.urgency = payload.urgency
    if payload.answers_json is not None:
        intake.answers_json = payload.answers_json

    db.commit()
    db.refresh(intake)
    return intake


# -------------------------
# DELETE by booking_id
# -------------------------

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_intake_form(
    booking_id: int = Query(..., gt=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    booking = _get_booking_or_404(db, booking_id)
    _ensure_can_edit_intake(current_user, booking)

    intake = db.query(IntakeForm).filter(IntakeForm.booking_id == booking_id).first()
    if not intake:
        raise HTTPException(status_code=404, detail="Intake not found")

    db.delete(intake)
    db.commit()
    return None


# -------------------------
# CASE-based read
# -------------------------

def _can_access_case_intake(db: Session, case_id: int, current_user):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if _is_admin(current_user):
        return case

    if _is_client(current_user) and getattr(case, "client_id", None) == current_user.id:
        return case

    if _is_lawyer(current_user):
        linked = (
            db.query(Booking)
            .filter(Booking.case_id == case_id, Booking.lawyer_id == current_user.id)
            .first()
        )
        if linked:
            return case

    raise HTTPException(status_code=403, detail="Not allowed")


@router.get("/cases/{case_id}", response_model=IntakeOut)
def get_intake_by_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    _can_access_case_intake(db, case_id, current_user)

    intake = db.query(IntakeForm).filter(IntakeForm.case_id == case_id).first()
    if not intake:
        raise HTTPException(status_code=404, detail="Intake not found")
    return intake


@router.post("/cases/{case_id}", response_model=IntakeOut, status_code=status.HTTP_201_CREATED)
def create_intake_for_case(
    case_id: int,
    payload: IntakeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    case = _can_access_case_intake(db, case_id, current_user)

    if not _is_client(current_user):
        raise HTTPException(status_code=403, detail="Only clients can submit intake forms")

    if getattr(case, "client_id", None) != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner client can submit intake for this case")

    existing = db.query(IntakeForm).filter(IntakeForm.case_id == case_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Intake already submitted for this case")

    intake = IntakeForm(
        booking_id=payload.booking_id,
        case_id=case_id,
        client_id=current_user.id,
        case_type=payload.case_type,
        subject=payload.subject,
        details=payload.details,
        urgency=payload.urgency,
        answers_json=payload.answers_json or {},
    )

    db.add(intake)
    db.commit()
    db.refresh(intake)
    return intake
