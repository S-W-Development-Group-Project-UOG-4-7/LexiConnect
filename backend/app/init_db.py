# backend/app/init_db.py

from app.database import Base, engine

# Import models so SQLAlchemy knows about them and can create tables
from app.models import user  # noqa: F401
from app.models import booking  # noqa: F401


def init_db():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created.")


if __name__ == "__main__":
    init_db()

