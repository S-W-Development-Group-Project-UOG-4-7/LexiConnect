import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use DATABASE_URL from environment if provided.
# Default = local SQLite file so everyone can run without installing Postgres.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./lexiconnect.db",
)

# If we are using SQLite, we need connect_args.
# For Postgres or other DBs, connect_args can be empty.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
