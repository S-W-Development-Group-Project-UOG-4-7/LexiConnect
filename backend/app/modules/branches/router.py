from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.branch import Branch

from app.modules.branches.schemas import (
    BranchCreate,
    BranchUpdate,
    BranchResponse,
)
from app.modules.branches import service


router = APIRouter(prefix="/api/branches", tags=["Branches"])


@router.get("", response_model=List[BranchResponse])
def list_active_branches(
    lawyer_id: int | None = Query(None, description="Optional filter by lawyer"),
    db: Session = Depends(get_db),
):
    query = db.query(Branch).filter(Branch.is_active.is_(True))
    if lawyer_id is not None:
        query = query.filter(Branch.lawyer_id == lawyer_id)
    rows = query.order_by(Branch.id.asc()).all()
    print(f"[branches] GET /api/branches -> {len(rows)} rows")
    return rows


@router.post("", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
def create_branch(
    payload: BranchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can create branches")

    lawyer = service.get_lawyer_by_user(db, current_user.email)
    return service.create_branch(db, lawyer, payload)


@router.get("/me", response_model=List[BranchResponse])
def get_my_branches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can view branches")

    lawyer = service.get_lawyer_by_user(db, current_user.email)
    return service.get_my_branches(db, lawyer)


@router.patch("/{branch_id}", response_model=BranchResponse)
def update_branch(
    branch_id: int,
    payload: BranchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lawyer = service.get_lawyer_by_user(db, current_user.email)

    branch = (
        db.query(Branch)
        .filter(Branch.id == branch_id, Branch.lawyer_id == lawyer.id)
        .first()
    )
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    return service.update_branch(db, branch, payload)


@router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_branch(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lawyer = service.get_lawyer_by_user(db, current_user.email)

    branch = (
        db.query(Branch)
        .filter(Branch.id == branch_id, Branch.lawyer_id == lawyer.id)
        .first()
    )
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    service.delete_branch(db, branch)
