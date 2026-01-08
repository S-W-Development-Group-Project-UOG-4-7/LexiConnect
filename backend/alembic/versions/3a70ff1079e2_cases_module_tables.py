"""cases module tables

Revision ID: 3a70ff1079e2
Revises: 01748acc3a52
Create Date: 2025-12-31 16:48:24.104739

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3a70ff1079e2'
down_revision: Union[str, None] = '01748acc3a52'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "cases",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("client_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),

        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("district", sa.String(length=100), nullable=False),

        sa.Column("summary_public", sa.Text(), nullable=False),
        sa.Column("summary_private", sa.Text(), nullable=True),

        sa.Column("status", sa.String(length=30), nullable=False, server_default="open"),
        sa.Column("selected_lawyer_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),

        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_index("idx_cases_client_id", "cases", ["client_id"])
    op.create_index("idx_cases_status", "cases", ["status"])
    op.create_index("idx_cases_district", "cases", ["district"])
    op.create_index("idx_cases_category", "cases", ["category"])
    op.create_index("idx_cases_selected_lawyer_id", "cases", ["selected_lawyer_id"])

    op.create_table(
        "case_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("case_id", sa.Integer(), sa.ForeignKey("cases.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lawyer_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),

        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"),

        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_index("idx_case_requests_case_id", "case_requests", ["case_id"])
    op.create_index("idx_case_requests_lawyer_id", "case_requests", ["lawyer_id"])
    op.create_unique_constraint("ux_case_requests_case_lawyer", "case_requests", ["case_id", "lawyer_id"])


def downgrade():
    op.drop_constraint("ux_case_requests_case_lawyer", "case_requests", type_="unique")
    op.drop_index("idx_case_requests_lawyer_id", table_name="case_requests")
    op.drop_index("idx_case_requests_case_id", table_name="case_requests")
    op.drop_table("case_requests")

    op.drop_index("idx_cases_selected_lawyer_id", table_name="cases")
    op.drop_index("idx_cases_category", table_name="cases")
    op.drop_index("idx_cases_district", table_name="cases")
    op.drop_index("idx_cases_status", table_name="cases")
    op.drop_index("idx_cases_client_id", table_name="cases")
    op.drop_table("cases")
















