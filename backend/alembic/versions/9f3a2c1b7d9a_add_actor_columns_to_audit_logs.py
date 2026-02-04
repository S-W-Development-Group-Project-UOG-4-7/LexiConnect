"""add actor columns to audit_logs

Revision ID: 9f3a2c1b7d9a
Revises: 5c2b1e05e123
Create Date: 2026-02-04 15:12:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9f3a2c1b7d9a"
down_revision: Union[str, None] = "5c2b1e05e123"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("audit_logs", sa.Column("actor_user_id", sa.Integer(), nullable=True))
    op.add_column("audit_logs", sa.Column("actor_email", sa.String(length=255), nullable=True))

    op.execute(
        """
        UPDATE audit_logs
        SET actor_user_id = user_id
        WHERE actor_user_id IS NULL
        """
    )
    op.execute(
        """
        UPDATE audit_logs
        SET actor_email = user_email
        WHERE actor_email IS NULL
        """
    )

    op.create_index("ix_audit_logs_actor_user_id", "audit_logs", ["actor_user_id"])
    op.create_index("ix_audit_logs_actor_email", "audit_logs", ["actor_email"])


def downgrade() -> None:
    op.drop_index("ix_audit_logs_actor_email", table_name="audit_logs")
    op.drop_index("ix_audit_logs_actor_user_id", table_name="audit_logs")
    op.drop_column("audit_logs", "actor_email")
    op.drop_column("audit_logs", "actor_user_id")
