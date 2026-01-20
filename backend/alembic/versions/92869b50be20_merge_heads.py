"""merge heads

Revision ID: 92869b50be20
Revises: bf7ee31482e3, 5cf1d2701c3d
Create Date: 2026-01-18 00:15:20.159132

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '92869b50be20'
down_revision: Union[str, None] = ('bf7ee31482e3', '5cf1d2701c3d')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















