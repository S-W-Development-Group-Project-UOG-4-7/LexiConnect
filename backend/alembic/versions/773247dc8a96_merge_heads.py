"""merge heads

Revision ID: 773247dc8a96
Revises: 0600645ff513, bf7ee31482e3
Create Date: 2026-01-15 19:46:42.130697

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '773247dc8a96'
down_revision: Union[str, None] = ('0600645ff513', 'bf7ee31482e3')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'apprentice';")



def downgrade() -> None:
    pass

















