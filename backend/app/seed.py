"""
Seed demo data for development.

Runs only when environment variables are enabled.

- SEED_DEMO_USERS=true
- SEED_DEMO_DISPUTES=true

Never overwrites existing data.
"""

import os
from sqlalchemy.orm import Session

from app.database import Base
from app.models.user import User, UserRole
from app.routers.auth import get_password_hash, get_user_by_email

# ✅ Correct imports based on your project structure
from app.modules.disputes.models import Dispute
from app.models.booking import Booking


def _is_true(name: str) -> bool:
    return os.getenv(name, "").lower() == "true"


# ======================================================
# USERS
# ======================================================
def seed_demo_users(db: Session):
    if not _is_true("SEED_DEMO_USERS"):
        return

    users = [
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

    created = 0
    skipped = 0

    for u in users:
        if get_user_by_email(db, u["email"]):
            skipped += 1
            continue

        db.add(
            User(
                full_name=u["full_name"],
                email=u["email"],
                phone=None,
                hashed_password=get_password_hash(u["password"]),
                role=u["role"],
            )
        )
        created += 1

    if created:
        db.commit()

    print(f"[SEED] Users → created={created}, skipped={skipped}")


# ======================================================
# DISPUTES
# ======================================================
def seed_demo_disputes(db: Session):
    if not _is_true("SEED_DEMO_DISPUTES"):
        return

    client_email = os.getenv("CLIENT_EMAIL", "client@lexiconnect.local")
    client = get_user_by_email(db, client_email)

    if not client:
        print("[SEED] Disputes skipped — client user not found")
        return

    # Get latest booking if exists (safe)
    latest_booking = (
        db.query(Booking)
        .filter(Booking.client_id == client.id)
        .order_by(Booking.id.desc())
        .first()
    )

    booking_id = latest_booking.id if latest_booking else None

    disputes = [
        {
            "title": "Lawyer did not respond",
            "description": "No response from lawyer after booking confirmation.",
        },
        {
            "title": "Appointment rescheduled without notice",
            "description": "Meeting time changed without informing the client.",
        },
        {
            "title": "Billing issue",
            "description": "Charged amount does not match agreed package.",
        },
    ]

    created = 0
    skipped = 0

    for d in disputes:
        # 🚫 Do NOT overwrite existing disputes
        exists = (
            db.query(Dispute)
            .filter(
                Dispute.client_id == client.id,
                Dispute.title == d["title"],
            )
            .first()
        )

        if exists:
            skipped += 1
            continue

        db.add(
            Dispute(
                client_id=client.id,
                booking_id=booking_id,
                title=d["title"],
                description=d["description"],
                status="PENDING",
            )
        )
        created += 1

    if created:
        db.commit()

    print(f"[SEED] Disputes → created={created}, skipped={skipped}")


# ======================================================
# ENTRY POINT
# ======================================================
def seed_all(db: Session):
    seed_demo_users(db)
    seed_demo_disputes(db)
