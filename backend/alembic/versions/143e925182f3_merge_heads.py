"""merge heads

Revision ID: 143e925182f3
Revises: add_documents_table, add_lawyer_availability
Create Date: 2025-12-27 00:17:14.721289

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '143e925182f3'
down_revision: Union[str, None] = ('add_documents_table', 'add_lawyer_availability')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















