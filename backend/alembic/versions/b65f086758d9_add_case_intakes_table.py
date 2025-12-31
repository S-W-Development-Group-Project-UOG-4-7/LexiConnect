"""add case_intakes table

Revision ID: b65f086758d9
Revises: b519bac94696
Create Date: 2025-12-31 17:00:49.846431

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b65f086758d9'
down_revision: Union[str, None] = 'b519bac94696'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "case_intakes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("case_id", sa.Integer(), nullable=False, unique=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft"),
        sa.Column("answers_json", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_index(
        "ix_case_intakes_case_id",
        "case_intakes",
        ["case_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_case_intakes_case_id", table_name="case_intakes")
    op.drop_table("case_intakes")

















