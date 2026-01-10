from logging.config import fileConfig
import os
import sys

from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine.url import make_url
from dotenv import load_dotenv

# -----------------------------------------------------------------------------
# Path + env loading
# -----------------------------------------------------------------------------
# This file lives at: backend/alembic/env.py
# Ensure we import the installed Alembic package, not this migrations folder.
MIGRATIONS_DIR = os.path.abspath(os.path.dirname(__file__))
if MIGRATIONS_DIR in sys.path:
    sys.path.remove(MIGRATIONS_DIR)

# We want backend/ as project root for imports and .env loading
BACKEND_DIR = os.path.abspath(os.path.join(MIGRATIONS_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Load env variables from backend/.env explicitly
ENV_PATH = os.path.join(BACKEND_DIR, ".env")
load_dotenv(ENV_PATH)

from alembic import context  # noqa: E402

# -----------------------------------------------------------------------------
# Alembic Config
# -----------------------------------------------------------------------------
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Get DATABASE_URL from environment (must exist)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Create backend/.env (copy from .env.example) "
        "and set DATABASE_URL=postgresql+psycopg2://lexiconnect:lexiconnect@127.0.0.1:5432/lexiconnect"
    )

db_url = make_url(DATABASE_URL)
if db_url.drivername == "postgresql":
    db_url = db_url.set(drivername="postgresql+psycopg2")
elif db_url.drivername != "postgresql+psycopg2":
    raise RuntimeError(
        f"DATABASE_URL must use PostgreSQL (postgresql+psycopg2); got '{db_url.drivername}'"
    )

# Override sqlalchemy.url in alembic.ini at runtime
config.set_main_option("sqlalchemy.url", db_url.render_as_string(hide_password=False))

# -----------------------------------------------------------------------------
# Import models for autogenerate
# -----------------------------------------------------------------------------
from app.database import Base  # noqa: E402

# Import all SQLAlchemy model modules so Alembic can discover metadata
from app.models import (  # noqa: F401,E402
    appointment,
    availability,
    booking,
    branch,
    kyc_submission,
    lawyer,
    lawyer_availability,
    lawyer_kyc,
    user,
)
from app.modules.availability import models as availability_models  # noqa: F401,E402
from app.modules.blackouts import models as blackout_models  # noqa: F401,E402
from app.modules.documents import models as document_models  # noqa: F401,E402
from app.modules.disputes import models as dispute_models  # noqa: F401,E402
from app.modules.intake import models as intake_models  # noqa: F401,E402
from app.modules.lawyer_profiles import models as lawyer_profile_models  # noqa: F401,E402
from app.modules.audit_log import models as audit_log_models  # noqa: F401,E402
from app.modules.queue import models as queue_models  # noqa: F401,E402

target_metadata = Base.metadata

# -----------------------------------------------------------------------------
# Migration runners
# -----------------------------------------------------------------------------
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
