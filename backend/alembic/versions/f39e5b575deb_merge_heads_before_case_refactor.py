"""merge heads before case refactor

Revision ID: f39e5b575deb
Revises: 9b3215e1c9aa, c85caf5994fc
Create Date: 2025-12-31 02:22:08.757520

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f39e5b575deb'
down_revision: Union[str, None] = ('9b3215e1c9aa', 'c85caf5994fc')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















