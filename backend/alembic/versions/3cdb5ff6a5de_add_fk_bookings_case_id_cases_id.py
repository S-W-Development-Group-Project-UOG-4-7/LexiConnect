"""add fk bookings.case_id -> cases.id

Revision ID: 3cdb5ff6a5de
Revises: 5881c0aee853
Create Date: 2026-01-08 01:30:26.968489
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "3cdb5ff6a5de"
down_revision: Union[str, None] = "5881c0aee853"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_bookings_case_id'
        ) THEN
            ALTER TABLE bookings
            ADD CONSTRAINT fk_bookings_case_id
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL;
        END IF;
    END$$;
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_case_id;")
