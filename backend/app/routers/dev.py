import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.routers.auth import get_password_hash, get_user_by_email

router = APIRouter(prefix="/dev", tags=["dev"])


def _is_dev_mode() -> bool:
    """Check if running in development/debug mode."""
    env = os.getenv("ENV", "").lower()
    debug = os.getenv("DEBUG", "").lower()
    return env == "development" or debug == "true"


@router.post("/seed-users")
def seed_users(db: Session = Depends(get_db)):
    """
    DEV-ONLY: Seed default users for frontend development.
    Only works when ENV=development or DEBUG=True.
    """
    if not _is_dev_mode():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only available in development mode. Set ENV=development or DEBUG=True.",
        )

    users_to_create = [
        {
            "email": "admin@lexiconnect.com",
            "password": "admin123",
            "role": UserRole.admin,
            "full_name": "System Admin",
        },
        {
            "email": "lawyer@example.com",
            "password": "lawyer123",
            "role": UserRole.lawyer,
            "full_name": "Test Lawyer",
        },
        {
            "email": "client@example.com",
            "password": "client123",
            "role": UserRole.client,
            "full_name": "Test Client",
        },
    ]

    created = []
    skipped = []

    for user_data in users_to_create:
        existing = get_user_by_email(db, user_data["email"])
        if existing:
            skipped.append({"email": user_data["email"], "role": user_data["role"].value})
            continue

        hashed_password = get_password_hash(user_data["password"])
        new_user = User(
            email=user_data["email"],
            full_name=user_data["full_name"],
            hashed_password=hashed_password,
            role=user_data["role"],
            phone=None,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        created.append(
            {
                "email": user_data["email"],
                "password": user_data["password"],
                "role": user_data["role"].value,
                "full_name": user_data["full_name"],
            }
        )

    return {
        "message": "Seed operation completed",
        "created": created,
        "skipped": skipped,
        "summary": {
            "total_created": len(created),
            "total_skipped": len(skipped),
        },
    }

