"""add case_id to bookings

Revision ID: c85caf5994fc
Revises: d19696d71e04
Create Date: 2025-12-31 00:33:39.846470

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c85caf5994fc'
down_revision: Union[str, None] = 'd19696d71e04'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















