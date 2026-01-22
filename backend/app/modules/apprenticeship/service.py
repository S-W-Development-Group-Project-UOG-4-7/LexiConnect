from sqlalchemy.orm import Session
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException, status
from app.models.user import User
from app.modules.cases.models import Case


from .models import CaseApprentice, ApprenticeCaseNote


def _role_str(user) -> str:
    role = getattr(user, "role", None)
    if role is None:
        return ""

    # Enum -> role.value
    val = getattr(role, "value", None)
    if val:
        return str(val).lower()

    s = str(role).strip().lower()
    # Handle "UserRole.lawyer"
    if "." in s:
        s = s.split(".")[-1]
    return s


def _is_lawyer(user) -> bool:
    r = _role_str(user)
    return r in ("lawyer", "admin")


def _is_apprentice(user) -> bool:
    """
    Apprentice-only endpoints.
    """
    r = _role_str(user)
    return r == "apprentice"


def assign_apprentice(db: Session, current_user, case_id: int, apprentice_id: int):
    if not _is_lawyer(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lawyers can assign apprentices",
        )

    if apprentice_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot assign yourself as an apprentice",
        )

    # Prevent duplicates
    existing = (
        db.query(CaseApprentice)
        .filter(
            CaseApprentice.case_id == case_id,
            CaseApprentice.apprentice_id == apprentice_id,
        )
        .first()
    )
    if existing:
        return existing

    assignment = CaseApprentice(
        case_id=case_id,
        lawyer_id=current_user.id,
        apprentice_id=apprentice_id,
    )

    db.add(assignment)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()

        msg = str(e.orig).lower() if getattr(e, "orig", None) else str(e).lower()

        # Friendly messages for common FK issues
        if "case_apprentices_case_id_fkey" in msg or "key (case_id)" in msg:
            raise HTTPException(status_code=400, detail="Case not found (invalid case_id).")
        if "case_apprentices_apprentice_id_fkey" in msg or "key (apprentice_id)" in msg:
            raise HTTPException(status_code=400, detail="Apprentice user not found (invalid apprentice_id).")
        if "uq_case_apprentices_case_apprentice" in msg or "unique" in msg:
            raise HTTPException(status_code=400, detail="This apprentice is already assigned to this case.")

        raise HTTPException(status_code=400, detail="Failed to assign apprentice (constraint error).")

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error while assigning apprentice.")

    db.refresh(assignment)
    return assignment


from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.user import User
from app.modules.cases.models import Case
from .models import CaseApprentice


def get_my_assigned_cases(db: Session, current_user):
    if not _is_apprentice(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only apprentices can access this endpoint",
        )

    rows = (
        db.query(CaseApprentice, User, Case)
        .join(User, User.id == CaseApprentice.lawyer_id)
        .join(Case, Case.id == CaseApprentice.case_id)
        .filter(CaseApprentice.apprentice_id == current_user.id)
        .order_by(desc(CaseApprentice.created_at))
        .all()
    )

    out = []
    for ca, lawyer, case in rows:
        out.append(
            {
                "id": ca.id,
                "case_id": ca.case_id,
                "lawyer_id": ca.lawyer_id,
                "apprentice_id": ca.apprentice_id,
                "created_at": ca.created_at,

                # lawyer info
                "lawyer_full_name": lawyer.full_name,
                "lawyer_email": lawyer.email,

                # case info
                "case_title": case.title,
                "case_category": case.category,
                "case_status": case.status,
                "district": getattr(case, "district", None),

                # ✅ keys frontend will read for "Assigned Lawyer"
                "supervising_lawyer": lawyer.full_name,
                "lawyer_name": lawyer.full_name,
                "lawyer": lawyer.full_name,
            }
        )

    return out

def add_note(db: Session, current_user, case_id: int, note: str):
    if not _is_apprentice(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only apprentices can add notes",
        )

    if not note or not note.strip():
        raise HTTPException(status_code=400, detail="Note cannot be empty.")

    assigned = (
        db.query(CaseApprentice)
        .filter(
            CaseApprentice.case_id == case_id,
            CaseApprentice.apprentice_id == current_user.id,
        )
        .first()
    )
    if not assigned:
        raise HTTPException(status_code=403, detail="You are not assigned to this case")

    n = ApprenticeCaseNote(case_id=case_id, apprentice_id=current_user.id, note=note.strip())
    db.add(n)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error while adding note.")

    db.refresh(n)
    return n


def get_case_notes_for_lawyer(db: Session, current_user, case_id: int):
    role = _role_str(current_user)

    # ✅ Apprentices: can view notes only for cases assigned to them
    if role == "apprentice":
        allowed = (
            db.query(CaseApprentice)
            .filter(
                CaseApprentice.case_id == case_id,
                CaseApprentice.apprentice_id == current_user.id,
            )
            .first()
        )
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to view notes for this case",
            )

        return (
            db.query(ApprenticeCaseNote)
            .filter(ApprenticeCaseNote.case_id == case_id)
            .order_by(desc(ApprenticeCaseNote.created_at))
            .all()
        )

    # ✅ Lawyers/Admin: can view notes only if THEY assigned an apprentice to this case
    if _is_lawyer(current_user):
        allowed = (
            db.query(CaseApprentice)
            .filter(
                CaseApprentice.case_id == case_id,
                CaseApprentice.lawyer_id == current_user.id,
            )
            .first()
        )
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to view notes for this case",
            )

        return (
            db.query(ApprenticeCaseNote)
            .filter(ApprenticeCaseNote.case_id == case_id)
            .order_by(desc(ApprenticeCaseNote.created_at))
            .all()
        )

    # everyone else (client etc.)
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not allowed to view notes for this case",
    )

