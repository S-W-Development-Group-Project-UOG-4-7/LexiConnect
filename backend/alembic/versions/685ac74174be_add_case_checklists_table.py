"""add case_checklists table

Revision ID: 685ac74174be
Revises: b65f086758d9
Create Date: 2025-12-31

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "685ac74174be"
down_revision = "b65f086758d9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "case_checklists",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("case_id", sa.Integer(), nullable=False),
        sa.Column("items_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_case_checklists_case_id",
        "case_checklists",
        ["case_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_case_checklists_case_id", table_name="case_checklists")
    op.drop_table("case_checklists")
