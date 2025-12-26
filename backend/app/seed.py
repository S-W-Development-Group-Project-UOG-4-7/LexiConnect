"""
Seed demo users for development.
Only runs if SEED_DEMO_USERS environment variable is set to "true" (case-insensitive).
"""
import os
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.models.lawyer import Lawyer
from app.routers.auth import get_password_hash, get_user_by_email


def seed_demo_users(db: Session):
    """
    Seed demo users if SEED_DEMO_USERS env var is "true" (case-insensitive).
    Creates admin, lawyer, and client users if they don't already exist.
    """
    seed_flag = os.getenv("SEED_DEMO_USERS", "").lower()
    if seed_flag != "true":
        return

    # Define users to seed from environment variables or defaults
    users_to_seed = [
        {
            "email": os.getenv("ADMIN_EMAIL", "admin@lexiconnect.local"),
            "password": os.getenv("ADMIN_PASSWORD", "Admin@123"),
            "role": UserRole.admin,
            "full_name": "Admin User",
        },
        {
            "email": os.getenv("LAWYER_EMAIL", "lawyer@lexiconnect.local"),
            "password": os.getenv("LAWYER_PASSWORD", "Lawyer@123"),
            "role": UserRole.lawyer,
            "full_name": "Lawyer User",
        },
        {
            "email": os.getenv("CLIENT_EMAIL", "client@lexiconnect.local"),
            "password": os.getenv("CLIENT_PASSWORD", "Client@123"),
            "role": UserRole.client,
            "full_name": "Client User",
        },
    ]

    created_count = 0
    skipped_count = 0

    for user_data in users_to_seed:
        # Check if user already exists
        existing = get_user_by_email(db, user_data["email"])
        if existing:
            skipped_count += 1
            continue

        # Create new user
        hashed_password = get_password_hash(user_data["password"])
        new_user = User(
            full_name=user_data["full_name"],
            email=user_data["email"],
            phone=None,
            hashed_password=hashed_password,
            role=user_data["role"],
        )
        db.add(new_user)
        created_count += 1

    # Commit once at the end
    if created_count > 0:
        db.commit()
        print(f"[SEED] Seeded {created_count} demo user(s). Skipped {skipped_count} existing user(s).")
    else:
        print(f"[SEED] All demo users already exist. Skipped {skipped_count} user(s).")

    # Create corresponding Lawyer records for lawyer users
    seed_lawyer_records(db)


def seed_lawyer_records(db: Session):
    """Create Lawyer records for users with lawyer role"""
    lawyer_users = db.query(User).filter(User.role == UserRole.lawyer).all()
    
    for user in lawyer_users:
        # Check if Lawyer record already exists
        existing_lawyer = db.query(Lawyer).filter(Lawyer.email == user.email).first()
        if not existing_lawyer:
            lawyer = Lawyer(
                name=user.full_name,
                email=user.email
            )
            db.add(lawyer)
            print(f"[SEED] Created Lawyer record for {user.email}")
    
    db.commit()
    print("[SEED] Lawyer records seeded.")

