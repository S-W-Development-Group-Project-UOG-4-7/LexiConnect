from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.branch import Branch as BranchModel
from ..schemas.branch import BranchCreate, Branch as BranchSchema

router = APIRouter()

fake_lawyer_id = 1  # Temporary until authentication works

@router.post("/branches", response_model=BranchSchema)
def create_branch(data: BranchCreate, db: Session = Depends(get_db)):
    new_branch = BranchModel(
        lawyer_id=fake_lawyer_id,
        name=data.name,
        district=data.district,
        city=data.city,
        address=data.address
    )
    db.add(new_branch)
    db.commit()
    db.refresh(new_branch)
    return new_branch


@router.get("/branches", response_model=list[BranchSchema])
def get_branches(lawyer_id: int, db: Session = Depends(get_db)):
    return db.query(BranchModel).filter(BranchModel.lawyer_id == lawyer_id).all()
