"""merge multiple heads

Revision ID: 2823cfaf8c53
Revises: 66a6695a0865, 6d20843f1363, 7798cb991828, 9352826d8aad, cba759616e52
Create Date: 2025-12-31 13:27:33.548943

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2823cfaf8c53'
down_revision: Union[str, None] = ('66a6695a0865', '6d20843f1363', '7798cb991828', '9352826d8aad', 'cba759616e52')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

















