"""add documents table

Revision ID: 38c90343d511
Revises: 18e8624bc153
Create Date: 2025-12-23 01:28:56.586623

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '38c90343d511'
down_revision: Union[str, None] = '18e8624bc153'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("bookings.id"), nullable=False, index=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("file_path", sa.String(), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    

def downgrade():
    #op.drop_index("ix_documents_booking_id", table_name="documents")
    op.drop_table("documents")















