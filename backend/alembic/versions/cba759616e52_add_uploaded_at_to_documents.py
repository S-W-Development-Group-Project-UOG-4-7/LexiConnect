"""add uploaded_at to documents

Revision ID: cba759616e52
Revises: 3fc0dde5f26a
Create Date: 2025-12-28 15:57:28.693635

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cba759616e52'
down_revision: Union[str, None] = '3fc0dde5f26a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    exists = bind.execute(sa.text(
        """
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'documents'
              AND column_name = 'uploaded_at'
        )
        """
    )).scalar()

    if exists:
        return

    op.add_column(
        "documents",
        sa.Column(
            "uploaded_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    bind = op.get_bind()
    exists = bind.execute(sa.text(
        """
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'documents'
              AND column_name = 'uploaded_at'
        )
        """
    )).scalar()

    if not exists:
        return

    op.drop_column("documents", "uploaded_at")

















