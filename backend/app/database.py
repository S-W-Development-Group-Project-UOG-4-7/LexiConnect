import os
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables (in case this module is imported before main.py loads dotenv)
load_dotenv()

# Use DATABASE_URL from environment if provided.
# Fallback to PostgreSQL URL matching .env.example for local development.
# For production, always set DATABASE_URL in environment.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://lexiconnect:lexiconnect@127.0.0.1:5433/lexiconnect",
)

# If we are using SQLite, we need connect_args.
# For Postgres or other DBs, connect_args can be empty.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    
)
print("✅ USING DATABASE:", engine.url)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
