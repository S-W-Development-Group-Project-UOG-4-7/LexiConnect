import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Example: postgresql+psycopg2://user:password@localhost:5432/lexiconnect
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/lexiconnect",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

