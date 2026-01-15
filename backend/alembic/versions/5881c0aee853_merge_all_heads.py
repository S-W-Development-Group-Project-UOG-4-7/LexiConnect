"""merge all heads

Revision ID: 5881c0aee853
Revises: 01748acc3a52, 685ac74174be, c03decbdfa68
Create Date: 2026-01-08 01:28:51.099096

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5881c0aee853'
down_revision: Union[str, None] = ('01748acc3a52', '685ac74174be', 'c03decbdfa68')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















