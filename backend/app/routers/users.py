from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.user_public import UserMeOut, UserPublicOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserMeOut)
def get_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # current_user is already loaded from DB in auth.get_current_user
    return UserMeOut(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        role=current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
        created_at=current_user.created_at,
    )


@router.get("/{user_id}", response_model=UserPublicOut)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # You can tighten this later (e.g., only lawyers/admin/apprentice can view)
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return UserPublicOut(
        id=u.id,
        full_name=u.full_name,
        role=u.role.value if hasattr(u.role, "value") else str(u.role),
    )
