"""add location to weekly availability

Revision ID: 5cf1d2701c3d
Revises: 199b62f9c364
Create Date: 2026-02-04 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5cf1d2701c3d'
down_revision: Union[str, None] = '199b62f9c364'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('weekly_availability', sa.Column('location', sa.String(length=255), nullable=True))

    # Backfill location data for existing rows using branch info when present
    conn = op.get_bind()
    conn.execute(
        sa.text(
            """
            UPDATE weekly_availability wa
            SET location = CONCAT(b.name, ' - ', b.address)
            FROM branches b
            WHERE wa.branch_id = b.id AND wa.location IS NULL
            """
        )
    )
    conn.execute(
        sa.text(
            """
            UPDATE weekly_availability
            SET location = 'Online Consultation'
            WHERE location IS NULL
            """
        )
    )


def downgrade() -> None:
    op.drop_column('weekly_availability', 'location')
