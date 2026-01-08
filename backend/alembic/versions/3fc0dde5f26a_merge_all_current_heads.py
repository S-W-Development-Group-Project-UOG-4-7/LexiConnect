"""merge all current heads

Revision ID: 3fc0dde5f26a
Revises: 38c90343d511, add_documents_table, add_lawyer_availability
Create Date: 2025-12-26 10:37:08.061291

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3fc0dde5f26a'
down_revision: Union[str, None] = ('38c90343d511', 'add_documents_table', 'add_lawyer_availability')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















