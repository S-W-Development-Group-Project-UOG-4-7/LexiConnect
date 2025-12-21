from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.branch import Branch as BranchOut
from app.schemas.branch import BranchCreate
from app.modules.branches.service import create_branch, seed_sri_lanka_branches

router = APIRouter(prefix="/branches", tags=["Branches"])


@router.post("/", response_model=BranchOut, status_code=status.HTTP_201_CREATED)
def create_branch_endpoint(
    payload: BranchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_branch(db, payload=payload, current_user=current_user)


@router.post("/seed-sri-lanka")
def seed_sri_lanka(db: Session = Depends(get_db)):
    return seed_sri_lanka_branches(db)
