"""merge heads after audit_logs description

Revision ID: 3c71584e6a02
Revises: 361b2af8dd94, 454d6e1a6884, b2f1a6c7d8e9
Create Date: 2026-02-04 13:25:35.694394

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3c71584e6a02'
down_revision: Union[str, None] = ('361b2af8dd94', '454d6e1a6884', 'b2f1a6c7d8e9')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















