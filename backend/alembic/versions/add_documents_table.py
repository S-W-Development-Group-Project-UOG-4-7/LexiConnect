"""add documents table

Revision ID: add_documents_table
Revises: fa3dcfa324d9
Create Date: 2025-12-22

"""
from alembic import op
import sqlalchemy as sa


# --- IMPORTANT ---
# We are using a readable manual revision id here ("add_documents_table").
# Thenu can change it to a normal hash id if needed before merging.
revision = "add_documents_table"
down_revision = "fa3dcfa324d9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("uploaded_by_user_id", sa.Integer(), nullable=True),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=True),
        sa.Column("file_path", sa.Text(), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["uploaded_by_user_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_documents_booking_id", "documents", ["booking_id"])
    op.create_index("ix_documents_uploaded_by_user_id", "documents", ["uploaded_by_user_id"])


def downgrade() -> None:
    op.drop_index("ix_documents_uploaded_by_user_id", table_name="documents")
    op.drop_index("ix_documents_booking_id", table_name="documents")
    op.drop_table("documents")
