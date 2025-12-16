from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

import os
import sys
from dotenv import load_dotenv

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Load environment variables
# Try to load from backend/.env explicitly
backend_dir = os.path.dirname(os.path.dirname(__file__))
env_path = os.path.join(backend_dir, '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()  # Fallback to default search

# Import Base and all models for autogenerate
from app.database import Base
# Import all models so Alembic can detect them
from app import models  # noqa: F401


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Get DATABASE_URL from environment
database_url = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://lexiconnect:lexiconnect@127.0.0.1:5433/lexiconnect",
)

# Override sqlalchemy.url in the alembic config
config.set_main_option("sqlalchemy.url", database_url)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # DEBUG: Uncomment below to diagnose connection issues
    # print("=" * 80)
    # print("ALEMBIC CONNECTION DIAGNOSTICS")
    # print("=" * 80)
    # print(f"repr(database_url): {repr(database_url)}")
    # print(f"os.getcwd(): {os.getcwd()}")
    # print(f"repr(os.getenv('DATABASE_URL')): {repr(os.getenv('DATABASE_URL'))}")
    # print(f"config.get_main_option('sqlalchemy.url'): {config.get_main_option('sqlalchemy.url')}")
    # 
    # # Test connection with psycopg2 directly
    # try:
    #     import psycopg2
    #     from urllib.parse import urlparse
    #     
    #     # Convert SQLAlchemy URL to psycopg2 format
    #     # postgresql+psycopg2:// -> postgresql://
    #     pg_url = database_url.replace("postgresql+psycopg2://", "postgresql://")
    #     parsed = urlparse(pg_url)
    #     
    #     print("\n--- Direct psycopg2 Connection Test ---")
    #     print(f"Connecting to: postgresql://{parsed.username}:***@{parsed.hostname}:{parsed.port}{parsed.path}")
    #     
    #     conn = psycopg2.connect(
    #         host=parsed.hostname,
    #         port=parsed.port or 5432,
    #         database=parsed.path.lstrip('/'),
    #         user=parsed.username,
    #         password=parsed.password
    #     )
    #     
    #     cur = conn.cursor()
    #     cur.execute("SELECT inet_server_addr(), inet_server_port(), version(), current_database(), current_user;")
    #     result = cur.fetchone()
    #     
    #     print("Connection successful!")
    #     print(f"Server Address: {result[0]}")
    #     print(f"Server Port: {result[1]}")
    #     print(f"PostgreSQL Version: {result[2]}")
    #     print(f"Current Database: {result[3]}")
    #     print(f"Current User: {result[4]}")
    #     
    #     cur.close()
    #     conn.close()
    #     print("--- psycopg2 test complete ---\n")
    #     
    # except Exception as e:
    #     print(f"\n--- psycopg2 Connection Test FAILED ---")
    #     print(f"Exception type: {type(e).__name__}")
    #     print(f"Exception message: {str(e)}")
    #     import traceback
    #     print("Full traceback:")
    #     traceback.print_exc()
    #     print("--- psycopg2 test complete ---\n")
    # 
    # print("=" * 80)
    # print("END DIAGNOSTICS")
    # print("=" * 80)
    # print()
    
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

