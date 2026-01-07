"""add_availability_rules_and_exceptions_tables

Revision ID: c03decbdfa68
Revises: b1a2c3d4e5f6
Create Date: 2025-12-31 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c03decbdfa68"
down_revision: Union[str, None] = "b1a2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create availability_rules table
    op.create_table(
        "availability_rules",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("lawyer_id", sa.Integer(), nullable=False),
        sa.Column("day_of_week", sa.String(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("branch_id", sa.Integer(), nullable=False),
        sa.Column("repeat_until", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["branch_id"], ["branches.id"], ),
        sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"], ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("lawyer_id", "day_of_week", "start_time", "end_time", "branch_id", name="uq_lawyer_availability_rule"),
    )
    op.create_index(op.f("ix_availability_rules_id"), "availability_rules", ["id"], unique=False)
    op.create_index(op.f("ix_availability_rules_lawyer_id"), "availability_rules", ["lawyer_id"], unique=False)
    
    # Create availability_exceptions table
    op.create_table(
        "availability_exceptions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("lawyer_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("reason", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"], ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("lawyer_id", "date", name="uq_lawyer_availability_exception"),
    )
    op.create_index(op.f("ix_availability_exceptions_id"), "availability_exceptions", ["id"], unique=False)
    op.create_index(op.f("ix_availability_exceptions_lawyer_id"), "availability_exceptions", ["lawyer_id"], unique=False)


def downgrade() -> None:
    # Drop availability_exceptions table
    op.drop_index(op.f("ix_availability_exceptions_lawyer_id"), table_name="availability_exceptions")
    op.drop_index(op.f("ix_availability_exceptions_id"), table_name="availability_exceptions")
    op.drop_table("availability_exceptions")
    
    # Drop availability_rules table
    op.drop_index(op.f("ix_availability_rules_lawyer_id"), table_name="availability_rules")
    op.drop_index(op.f("ix_availability_rules_id"), table_name="availability_rules")
    op.drop_table("availability_rules")
