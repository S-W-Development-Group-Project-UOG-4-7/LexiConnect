"""merge all heads

Revision ID: 0600645ff513
Revises: 5cf1d2701c3d, 79b6599a1b18, a97c36962ff8
Create Date: 2026-01-15 19:19:43.356443

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0600645ff513'
down_revision: Union[str, None] = ('5cf1d2701c3d', '79b6599a1b18', 'a97c36962ff8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















