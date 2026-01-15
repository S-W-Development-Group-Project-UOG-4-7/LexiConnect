"""add documents table

Revision ID: add_documents_table
Revises: fa3dcfa324d9
Create Date: 2025-12-22
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "add_documents_table"
down_revision = "fa3dcfa324d9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)

    tables = set(inspector.get_table_names())

    # If already created by another migration, don't recreate.
    if "documents" in tables:
        cols = {c["name"] for c in inspector.get_columns("documents")}

        # booking_id index (only if column exists)
        if "booking_id" in cols:
            op.create_index(
                "ix_documents_booking_id",
                "documents",
                ["booking_id"],
                unique=False,
                postgresql_concurrently=False,
                if_not_exists=True,  # SQLAlchemy 2.0+ on PG; if it errors, remove this and keep checkfirst below
            )

        # uploaded_by_user_id index (only if column exists)
        if "uploaded_by_user_id" in cols:
            op.create_index(
                "ix_documents_uploaded_by_user_id",
                "documents",
                ["uploaded_by_user_id"],
                unique=False,
                postgresql_concurrently=False,
                if_not_exists=True,
            )
        return

    # Otherwise create the table with the columns this migration expects
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

    op.create_index("ix_documents_booking_id", "documents", ["booking_id"], unique=False)
    op.create_index("ix_documents_uploaded_by_user_id", "documents", ["uploaded_by_user_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)

    if "documents" not in inspector.get_table_names():
        return

    # Drop indexes if they exist
    existing_indexes = {ix["name"] for ix in inspector.get_indexes("documents")}

    if "ix_documents_uploaded_by_user_id" in existing_indexes:
        op.drop_index("ix_documents_uploaded_by_user_id", table_name="documents")
    if "ix_documents_booking_id" in existing_indexes:
        op.drop_index("ix_documents_booking_id", table_name="documents")

    op.execute("DROP TABLE IF EXISTS documents CASCADE")
