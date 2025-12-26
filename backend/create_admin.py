"""
Standalone script to create an admin user for LexiConnect.
Uses the same database config and password hashing as the main app.

Usage:
    python create_admin.py

Or from project root:
    python backend/create_admin.py
"""
import sys
import os

# Add the backend directory to Python path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, DATABASE_URL
from app.models.user import User, UserRole
from app.routers.auth import get_password_hash, get_user_by_email


def create_admin():
    """Create admin user if it doesn't exist."""
    print(f"📦 Database: {DATABASE_URL}")
    print("🔍 Checking for admin user...")
    
    db = SessionLocal()
    try:
        admin_email = "admin@lexiconnect.com"
        
        # Check if admin already exists
        existing = get_user_by_email(db, admin_email)
        if existing:
            print(f"[SUCCESS] Admin user already exists!")
            print(f"   Email: {existing.email}")
            print(f"   Role: {existing.role}")
            print(f"   ID: {existing.id}")
            return
        
        # Create admin user
        hashed_password = get_password_hash("admin123")
        admin_user = User(
            email=admin_email,
            full_name="Admin User",
            hashed_password=hashed_password,
            role=UserRole.admin,
            phone=None,
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("[SUCCESS] Admin user created successfully!")
        print(f"   Email: {admin_email}")
        print(f"   Password: admin123")
        print(f"   Role: admin")
        print(f"   Full Name: Admin User")
        print(f"   ID: {admin_user.id}")
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error creating admin user: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()


