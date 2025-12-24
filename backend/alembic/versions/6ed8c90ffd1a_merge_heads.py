"""merge heads

Revision ID: 6ed8c90ffd1a
Revises: b0d38fe95f95, b1a2c3d4e5f6
Create Date: 2025-12-22 01:24:01.603646

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6ed8c90ffd1a'
down_revision: Union[str, None] = ('b0d38fe95f95', 'b1a2c3d4e5f6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
















