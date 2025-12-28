"""add title to documents

Revision ID: 9352826d8aad
Revises: 3fc0dde5f26a
Create Date: 2025-12-28 15:08:56.836833

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9352826d8aad'
down_revision: Union[str, None] = '3fc0dde5f26a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("documents", sa.Column("title", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("documents", "title")

















