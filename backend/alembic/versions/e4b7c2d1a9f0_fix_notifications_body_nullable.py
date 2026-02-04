"""fix notifications body nullable

Revision ID: e4b7c2d1a9f0
Revises: f3c8b9a1d2e4
Create Date: 2026-02-04 21:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e4b7c2d1a9f0"
down_revision: Union[str, None] = "f3c8b9a1d2e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.alter_column(
        "notifications",
        "body",
        existing_type=sa.Text(),
        nullable=True,
    )
    op.alter_column(
        "notifications",
        "meta",
        existing_type=sa.JSON(),
        nullable=True,
        server_default=sa.text("'{}'::json"),
    )


def downgrade():
    op.execute("UPDATE notifications SET body = message WHERE body IS NULL")
    op.alter_column(
        "notifications",
        "body",
        existing_type=sa.Text(),
        nullable=False,
    )
    op.alter_column(
        "notifications",
        "meta",
        existing_type=sa.JSON(),
        nullable=False,
        server_default=None,
    )
