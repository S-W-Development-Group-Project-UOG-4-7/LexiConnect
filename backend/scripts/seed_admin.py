"""
Seed admin user script.
Creates an admin user using the same User model and password hashing as /auth/register.

Usage:
    python -m scripts.seed_admin
    or
    python backend/scripts/seed_admin.py
"""
import sys
import os

# Add backend directory to path for imports
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.routers.auth import get_password_hash, get_user_by_email


def seed_admin():
    """Create admin user if it doesn't exist."""
    db = SessionLocal()
    try:
        admin_email = "admin@lexiconnect.com"
        
        # Check if admin already exists
        existing = get_user_by_email(db, admin_email)
        if existing:
            print(f"Admin user already exists: {admin_email}")
            return
        
        # Create admin user using the same approach as /auth/register
        hashed_password = get_password_hash("admin123")
        admin_user = User(
            full_name="Admin User",
            email=admin_email,
            phone=None,
            hashed_password=hashed_password,
            role=UserRole.admin,
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("Admin created: admin@lexiconnect.com / admin123")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating admin: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()

