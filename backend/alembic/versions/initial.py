"""initial

Revision ID: initial
Revises: 
Create Date: 2025-12-27
"""

from alembic import op  # noqa
import sqlalchemy as sa  # noqa

# revision identifiers, used by Alembic.
revision = "initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Stub base revision: DB may already contain tables created outside Alembic.
    pass


def downgrade() -> None:
    pass
