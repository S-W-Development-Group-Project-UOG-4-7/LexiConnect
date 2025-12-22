"""
Safe idempotent seed script for FastAPI + SQLAlchemy.
Creates demo accounts (admin, lawyers, clients), sample bookings, and sample disputes if they don't exist.
Does NOT wipe existing data.

Usage:
    python scripts/seed.py
    or
    python -m scripts.seed
"""
import sys
import os
from datetime import datetime, timedelta, timezone

# Add backend directory to path for imports
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.booking import Booking
from app.modules.disputes.models import Dispute
from app.routers.auth import get_password_hash, get_user_by_email


def get_or_create_user(db, email, password, full_name, role):
    """Get existing user or create new one. Returns (user, created)."""
    existing = get_user_by_email(db, email)
    if existing:
        return existing, False

    hashed_password = get_password_hash(password)
    new_user = User(
        full_name=full_name,
        email=email,
        phone=None,
        hashed_password=hashed_password,
        role=role,
    )
    db.add(new_user)
    db.flush()  # Flush to get the ID without committing
    return new_user, True


def seed_users(db):
    """Seed demo users. Returns dict with created/existing counts."""
    users_to_create = [
        # Required accounts
        {
            "email": "admin@lexiconnect.local",
            "password": "Admin@123",
            "full_name": "Admin User",
            "role": UserRole.admin,
        },
        {
            "email": "lawyer@lexiconnect.local",
            "password": "Lawyer@123",
            "full_name": "Lawyer One",
            "role": UserRole.lawyer,
        },
        {
            "email": "client@lexiconnect.local",
            "password": "Client@123",
            "full_name": "Client One",
            "role": UserRole.client,
        },
        # Additional clients
        {
            "email": "client2@lexiconnect.local",
            "password": "Client@123",
            "full_name": "Client Two",
            "role": UserRole.client,
        },
        # Additional lawyers
        {
            "email": "lawyer2@lexiconnect.local",
            "password": "Lawyer@123",
            "full_name": "Lawyer Two",
            "role": UserRole.lawyer,
        },
        {
            "email": "lawyer3@lexiconnect.local",
            "password": "Lawyer@123",
            "full_name": "Lawyer Three",
            "role": UserRole.lawyer,
        },
    ]

    created = []
    existing = []
    users_dict = {}

    for user_data in users_to_create:
        user, was_created = get_or_create_user(
            db,
            user_data["email"],
            user_data["password"],
            user_data["full_name"],
            user_data["role"],
        )
        users_dict[user_data["email"]] = user
        if was_created:
            created.append(user_data["email"])
        else:
            existing.append(user_data["email"])

    return {
        "created": created,
        "existing": existing,
        "users": users_dict,
    }


def seed_bookings(db, users_dict):
    """Seed demo bookings. Returns dict with created/existing counts + booking objects."""
    client1 = users_dict.get("client@lexiconnect.local")
    client2 = users_dict.get("client2@lexiconnect.local")
    lawyer1 = users_dict.get("lawyer@lexiconnect.local")
    lawyer2 = users_dict.get("lawyer2@lexiconnect.local")
    lawyer3 = users_dict.get("lawyer3@lexiconnect.local")

    if not all([client1, client2, lawyer1, lawyer2, lawyer3]):
        print("⚠️  Warning: Not all required users exist. Skipping bookings.")
        return {"created": [], "existing": [], "bookings": []}

    now = datetime.now(timezone.utc)

    bookings_to_create = [
        {
            "client_id": client1.id,
            "lawyer_id": lawyer1.id,
            "branch_id": None,
            "scheduled_at": now + timedelta(days=7),
            "note": "Initial consultation for property dispute",
            "status": "pending",
        },
        {
            "client_id": client1.id,
            "lawyer_id": lawyer2.id,
            "branch_id": None,
            "scheduled_at": now + timedelta(days=14),
            "note": "Contract review meeting",
            "status": "confirmed",
        },
        {
            "client_id": client2.id,
            "lawyer_id": lawyer1.id,
            "branch_id": None,
            "scheduled_at": now + timedelta(days=10),
            "note": "Family law consultation",
            "status": "pending",
        },
        {
            "client_id": client2.id,
            "lawyer_id": lawyer3.id,
            "branch_id": None,
            "scheduled_at": now + timedelta(days=-1),
            "note": "Completed consultation",
            "status": "cancelled",
        },
    ]

    created = []
    existing = []
    booking_objs = []

    for booking_data in bookings_to_create:
        existing_booking = db.query(Booking).filter(
            Booking.client_id == booking_data["client_id"],
            Booking.lawyer_id == booking_data["lawyer_id"],
            Booking.scheduled_at == booking_data["scheduled_at"],
        ).first()

        if existing_booking:
            existing.append(f"Booking {existing_booking.id}")
            booking_objs.append(existing_booking)
            continue

        new_booking = Booking(**booking_data)
        db.add(new_booking)
        db.flush()
        booking_objs.append(new_booking)

        created.append(
            f"Booking {new_booking.id} (Client {booking_data['client_id']} -> Lawyer {booking_data['lawyer_id']} | {booking_data['status']})"
        )

    return {"created": created, "existing": existing, "bookings": booking_objs}


def seed_disputes(db, booking_objs):
    """Seed demo disputes linked to bookings. Idempotent."""
    if not booking_objs:
        print("⚠️  Warning: No bookings found. Skipping disputes.")
        return {"created": [], "existing": []}

    sample_bookings = booking_objs[:2]

    created = []
    existing = []

    for bk in sample_bookings:
        title = f"Dispute about booking #{bk.id}"

        already = db.query(Dispute).filter(
            Dispute.booking_id == bk.id,
            Dispute.title == title,
        ).first()

        if already:
            existing.append(f"Dispute {already.id} (booking {bk.id})")
            continue

        d = Dispute(
            booking_id=bk.id,
            client_id=bk.client_id,
            title=title,
            description=f"Seeded dispute: client raised an issue regarding booking {bk.id}.",
            status="PENDING",
            admin_note=None,
        )
        db.add(d)
        db.flush()
        created.append(f"Dispute {d.id} (booking {bk.id})")

    return {"created": created, "existing": existing}


def main():
    print("🌱 Starting seed script...")
    print("=" * 60)

    db = SessionLocal()
    try:
        print("\n📦 Seeding users...")
        users_result = seed_users(db)
        db.commit()

        for email in users_result["users"]:
            db.refresh(users_result["users"][email])

        print("\n📅 Seeding bookings...")
        bookings_result = seed_bookings(db, users_result["users"])
        db.commit()

        for b in bookings_result["bookings"]:
            db.refresh(b)

        print("\n⚖️ Seeding disputes...")
        disputes_result = seed_disputes(db, bookings_result["bookings"])
        db.commit()

        print("\n" + "=" * 60)
        print("✅ Seed Summary")
        print("=" * 60)

        print(f"\n👥 Users:")
        print(f"   Created: {len(users_result['created'])}")
        for email in users_result["created"]:
            print(f"     ✓ {email}")
        print(f"   Already existed: {len(users_result['existing'])}")
        for email in users_result["existing"]:
            print(f"     - {email}")

        print(f"\n📋 Bookings:")
        print(f"   Created: {len(bookings_result['created'])}")
        for item in bookings_result["created"]:
            print(f"     ✓ {item}")
        print(f"   Already existed: {len(bookings_result['existing'])}")
        for item in bookings_result["existing"]:
            print(f"     - {item}")

        print(f"\n⚖️ Disputes:")
        print(f"   Created: {len(disputes_result['created'])}")
        for item in disputes_result["created"]:
            print(f"     ✓ {item}")
        print(f"   Already existed: {len(disputes_result['existing'])}")
        for item in disputes_result["existing"]:
            print(f"     - {item}")

        print("\n" + "=" * 60)
        print("✅ Seed completed successfully!")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

