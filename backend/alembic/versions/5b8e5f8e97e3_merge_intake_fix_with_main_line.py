"""merge intake fix with main line

Revision ID: 5b8e5f8e97e3
Revises: 3fc0dde5f26a, f832dbab259e
Create Date: 2025-12-27 19:15:18.559520

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5b8e5f8e97e3'
down_revision: Union[str, None] = ('3fc0dde5f26a', 'f832dbab259e')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















