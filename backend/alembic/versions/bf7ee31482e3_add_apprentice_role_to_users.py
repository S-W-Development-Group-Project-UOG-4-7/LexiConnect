"""add apprentice role to users

Revision ID: bf7ee31482e3
Revises: 4ced4e889651
Create Date: 2026-01-11 18:35:40.576971
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "bf7ee31482e3"
down_revision: Union[str, None] = "4ced4e889651"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ✅ PostgreSQL enum type created by SQLAlchemy is usually named 'userrole'
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'apprentice';")


def downgrade() -> None:
    # Postgres cannot DROP an enum value easily.
    # If you really need downgrade support, you must recreate the enum type.
    raise NotImplementedError("Downgrade not supported for adding a Postgres enum value.")
