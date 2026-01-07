"""add case_id to bookings

Revision ID: 9b3215e1c9aa
Revises: d19696d71e04
Create Date: 2026-01-05 01:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9b3215e1c9aa"
down_revision: Union[str, None] = "d19696d71e04"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Postgres-safe: only add if missing
    op.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_package_id INTEGER;")
    op.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS case_id INTEGER;")

    # Indexes (safe)
    op.execute("CREATE INDEX IF NOT EXISTS ix_bookings_service_package_id ON bookings (service_package_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_bookings_case_id ON bookings (case_id);")

    # Foreign keys: Postgres doesn't support IF NOT EXISTS for FK, so check pg_constraint
    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_bookings_service_package_id'
        ) THEN
            ALTER TABLE bookings
            ADD CONSTRAINT fk_bookings_service_package_id
            FOREIGN KEY (service_package_id) REFERENCES service_packages(id);
        END IF;
    END$$;
    """)

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
