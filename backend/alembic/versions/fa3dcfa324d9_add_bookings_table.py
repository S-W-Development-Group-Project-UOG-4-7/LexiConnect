"""add bookings table

Revision ID: fa3dcfa324d9
Revises: 526bd4ed3edb
Create Date: 2025-12-17 01:26:14.333702

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fa3dcfa324d9'
down_revision: Union[str, None] = '526bd4ed3edb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop existing bookings table from init migration if it exists
    # (users and branches tables exist from init migration, so FKs are safe)
    op.drop_table("bookings")
    
    # Create bookings table with correct schema matching Booking model
    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("client_id", sa.Integer(), nullable=False),
        sa.Column("lawyer_id", sa.Integer(), nullable=False),
        sa.Column("branch_id", sa.Integer(), nullable=True),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["client_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["branch_id"], ["branches.id"]),
    )
    op.create_index("ix_bookings_client_id", "bookings", ["client_id"])
    op.create_index("ix_bookings_lawyer_id", "bookings", ["lawyer_id"])
    op.create_index("ix_bookings_branch_id", "bookings", ["branch_id"])


def downgrade() -> None:
    # Drop the new bookings table
    op.drop_index("ix_bookings_branch_id", table_name="bookings")
    op.drop_index("ix_bookings_lawyer_id", table_name="bookings")
    op.drop_index("ix_bookings_client_id", table_name="bookings")
    op.drop_table("bookings")
    
    # Recreate the old bookings table structure from init migration
    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("client_id", sa.Integer(), nullable=False),
        sa.Column("lawyer_id", sa.Integer(), nullable=False),
        sa.Column("branch_id", sa.Integer(), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("time", sa.Time(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["client_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_bookings_id"), "bookings", ["id"], unique=False)




