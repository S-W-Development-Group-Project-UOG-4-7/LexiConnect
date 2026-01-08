"""add title to documents

Revision ID: 9352826d8aad
Revises: 3fc0dde5f26a
Create Date: 2025-12-28 15:08:56.836833
"""
from alembic import op

revision = "9352826d8aad"
down_revision = "3fc0dde5f26a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE documents ADD COLUMN IF NOT EXISTS title VARCHAR(255)")


def downgrade() -> None:
    op.execute("ALTER TABLE documents DROP COLUMN IF EXISTS title")
