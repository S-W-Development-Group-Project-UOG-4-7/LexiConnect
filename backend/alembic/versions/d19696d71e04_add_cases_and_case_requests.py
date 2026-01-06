"""add cases and case_requests

Revision ID: d19696d71e04
Revises: 0e3f9c3a2b1c
Create Date: 2025-12-31 00:17:06.570543

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd19696d71e04'
down_revision: Union[str, None] = '0e3f9c3a2b1c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "bookings",
        sa.Column("case_id", sa.Integer, nullable=True)
    )
    op.create_foreign_key(
        "fk_bookings_case",
        "bookings",
        "cases",
        ["case_id"],
        ["id"],
        ondelete="SET NULL"
    )
    op.create_index("ix_bookings_case_id", "bookings", ["case_id"])

def downgrade():
    op.drop_index("ix_bookings_case_id", table_name="bookings")
    op.drop_constraint("fk_bookings_case", "bookings", type_="foreignkey")
    op.drop_column("bookings", "case_id")