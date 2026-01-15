"""merge heads after apprenticeship

Revision ID: 4ced4e889651
Revises: 79b6599a1b18, a97c36962ff8
Create Date: 2026-01-08 13:40:03.277597

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4ced4e889651'
down_revision: Union[str, None] = ('79b6599a1b18', 'a97c36962ff8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















