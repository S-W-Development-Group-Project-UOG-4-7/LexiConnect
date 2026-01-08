from sqlalchemy.orm import Session
from app.models.branch import Branch
from app.models.lawyer import Lawyer
from fastapi import HTTPException


def get_lawyer_by_user(db: Session, user_email: str) -> Lawyer:
    lawyer = db.query(Lawyer).filter(Lawyer.email == user_email).first()
    if not lawyer:
        raise HTTPException(status_code=400, detail="Lawyer profile not found")
    return lawyer


def create_branch(db: Session, lawyer: Lawyer, data):
    branch = Branch(
        lawyer_id=lawyer.id,
        name=data.name,
        district=data.district,
        city=data.city,
        address=data.address,
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


def get_my_branches(db: Session, lawyer: Lawyer):
    return db.query(Branch).filter(Branch.lawyer_id == lawyer.id).all()


def update_branch(db: Session, branch: Branch, data):
    for field, value in data.dict(exclude_unset=True).items():
        setattr(branch, field, value)
    db.commit()
    db.refresh(branch)
    return branch


def delete_branch(db: Session, branch: Branch):
    db.delete(branch)
    db.commit()
