"""add intake_forms

Revision ID: 2b67d061365b
Revises: e8e339c12acd
Create Date: 2025-12-27 00:58:55.217156

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b67d061365b'
down_revision: Union[str, None] = 'e8e339c12acd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "intake_forms",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("client_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("answers", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_intake_forms_booking_id", "intake_forms", ["booking_id"])
    op.create_index("ix_intake_forms_client_id", "intake_forms", ["client_id"])


def downgrade():
    op.drop_index("ix_intake_forms_client_id", table_name="intake_forms")
    op.drop_index("ix_intake_forms_booking_id", table_name="intake_forms")
    op.drop_table("intake_forms")
















