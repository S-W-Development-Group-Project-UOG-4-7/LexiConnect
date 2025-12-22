from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.branch import Branch
from app.models.user import User
from app.schemas.branch import BranchCreate

SRI_LANKA_BRANCH_NAMES: list[str] = [
    "Colombo",
    "Kandy",
    "Galle",
    "Jaffna",
    "Kurunegala",
    "Negombo",
    "Matara",
    "Anuradhapura",
    "Badulla",
    "Ratnapura",
]


def create_branch(db: Session, *, payload: BranchCreate, current_user: User) -> Branch:
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    branch = Branch(
        lawyer_id=current_user.id,
        name=payload.name,
        district=payload.district,
        city=payload.city,
        address=payload.address,
    )

    db.add(branch)
    try:
        db.commit()
    except (IntegrityError, SQLAlchemyError):
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to create branch",
        )

    db.refresh(branch)
    return branch


def seed_sri_lanka_branches(db: Session) -> dict[str, list[str]]:
    existing = (
        db.query(Branch.name)
        .filter(Branch.name.in_(SRI_LANKA_BRANCH_NAMES))
        .all()
    )
    existing_names = {row[0] for row in existing}

    inserted: list[str] = []
    skipped: list[str] = []

    for name in SRI_LANKA_BRANCH_NAMES:
        if name in existing_names:
            skipped.append(name)
            continue

        # NOTE:
        # Current Branch model/table in this codebase requires district/city/address.
        # We use district to store the country value "Sri Lanka".
        branch = Branch(
            name=name,
            district="Sri Lanka",
            city=name,
            address="Sri Lanka",
        )
        db.add(branch)
        inserted.append(name)

    db.commit()

    return {"inserted": inserted, "skipped": skipped}
