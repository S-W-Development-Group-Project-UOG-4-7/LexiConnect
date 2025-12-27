"""merge all heads

Revision ID: e8e339c12acd
Revises: 143e925182f3, 38c90343d511
Create Date: 2025-12-27 00:21:00.114861

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8e339c12acd'
down_revision: Union[str, None] = ('143e925182f3', '38c90343d511')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















