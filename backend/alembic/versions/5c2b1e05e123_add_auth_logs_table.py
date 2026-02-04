"""add auth_logs table

Revision ID: 5c2b1e05e123
Revises: 3c71584e6a02
Create Date: 2026-02-04 14:19:17.006706

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5c2b1e05e123'
down_revision: Union[str, None] = '3c71584e6a02'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "auth_logs",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),

        # event data
        sa.Column("event_type", sa.String(length=32), nullable=False),  # e.g. LOGIN
        sa.Column("success", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),

        # request metadata
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),

        # optional: reason/message for failed logins
        sa.Column("message", sa.Text(), nullable=True),
    )

    op.create_index("ix_auth_logs_occurred_at", "auth_logs", ["occurred_at"])
    op.create_index("ix_auth_logs_event_type_occurred_at", "auth_logs", ["event_type", "occurred_at"])
    op.create_index("ix_auth_logs_user_id", "auth_logs", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_auth_logs_user_id", table_name="auth_logs")
    op.drop_index("ix_auth_logs_event_type_occurred_at", table_name="auth_logs")
    op.drop_index("ix_auth_logs_occurred_at", table_name="auth_logs")
    op.drop_table("auth_logs")














