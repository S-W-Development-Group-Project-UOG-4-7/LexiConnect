"""add title to documents

Revision ID: 7798cb991828
Revises: add_documents_table
Create Date: 2025-12-29
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "7798cb991828"
down_revision = "add_documents_table"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE documents ADD COLUMN IF NOT EXISTS title VARCHAR(255)")


def downgrade() -> None:
    op.execute("ALTER TABLE documents DROP COLUMN IF EXISTS title")
