"""merge heads after dev pull

Revision ID: 6e9ecc0c8434
Revises: 5f36a2722701, 82b9323d0496
Create Date: 2026-01-20 17:50:33.667726

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6e9ecc0c8434'
down_revision: Union[str, None] = ('5f36a2722701', '82b9323d0496')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















