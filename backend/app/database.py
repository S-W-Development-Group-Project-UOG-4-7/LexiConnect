import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import sessionmaker, declarative_base

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is required and must be set to a PostgreSQL DSN "
        "(e.g. postgresql+psycopg2://lexiconnect:lexiconnect@127.0.0.1:5432/lexiconnect)"
    )

db_url = make_url(DATABASE_URL)
if db_url.drivername == "postgresql":
    db_url = db_url.set(drivername="postgresql+psycopg2")
elif db_url.drivername != "postgresql+psycopg2":
    raise RuntimeError(f"DATABASE_URL must use PostgreSQL driver; got '{db_url.drivername}'")

engine = create_engine(
    db_url.render_as_string(hide_password=False),
    pool_pre_ping=True,
)

print("USING DATABASE:", db_url.render_as_string(hide_password=True))

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
