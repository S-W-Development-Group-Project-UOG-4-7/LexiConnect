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
    "postgresql+psycopg2://lexiconnect:lexiconnect@127.0.0.1:5432/lexiconnect",
)

# If we are using SQLite, we need connect_args.
# For Postgres or other DBs, connect_args can be empty.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
)

# Mask password in DATABASE_URL for logging
def mask_password(url_str: str) -> str:
    """Mask password in database URL for safe logging."""
    from urllib.parse import urlparse, urlunparse
    parsed = urlparse(str(url_str))
    if parsed.password:
        # Replace password with ***
        netloc = f"{parsed.username}:***@{parsed.hostname}"
        if parsed.port:
            netloc += f":{parsed.port}"
        masked = urlunparse((parsed.scheme, netloc, parsed.path, parsed.params, parsed.query, parsed.fragment))
        return masked
    return str(url_str)

import logging
logger = logging.getLogger(__name__)
logger.info("USING DATABASE: %s", mask_password(engine.url))


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
