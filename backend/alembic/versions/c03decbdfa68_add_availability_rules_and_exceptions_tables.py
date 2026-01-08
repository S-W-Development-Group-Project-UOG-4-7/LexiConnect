"""add_availability_rules_and_exceptions_tables

Revision ID: c03decbdfa68
Revises: b1a2c3d4e5f6
Create Date: 2025-12-31 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision: str = "c03decbdfa68"
down_revision: Union[str, None] = "b1a2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)
    tables = set(insp.get_table_names())

    # ---------------- availability_rules ----------------
    if "availability_rules" not in tables:
        op.create_table(
            "availability_rules",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("lawyer_id", sa.Integer(), nullable=False),
            sa.Column("day_of_week", sa.String(), nullable=False),
            sa.Column("start_time", sa.Time(), nullable=False),
            sa.Column("end_time", sa.Time(), nullable=False),
            sa.Column("branch_id", sa.Integer(), nullable=False),
            sa.Column("repeat_until", sa.Date(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["branch_id"], ["branches.id"]),
            sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "lawyer_id",
                "day_of_week",
                "start_time",
                "end_time",
                "branch_id",
                name="uq_lawyer_availability_rule",
            ),
        )

    # create indexes safely (only if table exists and index missing)
    if "availability_rules" in tables or "availability_rules" in set(insp.get_table_names()):
        rule_indexes = {ix["name"] for ix in insp.get_indexes("availability_rules")}
        if "ix_availability_rules_id" not in rule_indexes:
            op.create_index("ix_availability_rules_id", "availability_rules", ["id"], unique=False)
        if "ix_availability_rules_lawyer_id" not in rule_indexes:
            op.create_index("ix_availability_rules_lawyer_id", "availability_rules", ["lawyer_id"], unique=False)

    # ---------------- availability_exceptions ----------------
    tables = set(insp.get_table_names())  # refresh after possible creates
    if "availability_exceptions" not in tables:
        op.create_table(
            "availability_exceptions",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("lawyer_id", sa.Integer(), nullable=False),
            sa.Column("date", sa.Date(), nullable=False),
            sa.Column("reason", sa.String(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "lawyer_id",
                "date",
                name="uq_lawyer_availability_exception",
            ),
        )

    if "availability_exceptions" in set(insp.get_table_names()):
        exc_indexes = {ix["name"] for ix in insp.get_indexes("availability_exceptions")}
        if "ix_availability_exceptions_id" not in exc_indexes:
            op.create_index("ix_availability_exceptions_id", "availability_exceptions", ["id"], unique=False)
        if "ix_availability_exceptions_lawyer_id" not in exc_indexes:
            op.create_index("ix_availability_exceptions_lawyer_id", "availability_exceptions", ["lawyer_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)
    tables = set(insp.get_table_names())

    if "availability_exceptions" in tables:
        exc_indexes = {ix["name"] for ix in insp.get_indexes("availability_exceptions")}
        if "ix_availability_exceptions_lawyer_id" in exc_indexes:
            op.drop_index("ix_availability_exceptions_lawyer_id", table_name="availability_exceptions")
        if "ix_availability_exceptions_id" in exc_indexes:
            op.drop_index("ix_availability_exceptions_id", table_name="availability_exceptions")
        op.drop_table("availability_exceptions")

    tables = set(insp.get_table_names())
    if "availability_rules" in tables:
        rule_indexes = {ix["name"] for ix in insp.get_indexes("availability_rules")}
        if "ix_availability_rules_lawyer_id" in rule_indexes:
            op.drop_index("ix_availability_rules_lawyer_id", table_name="availability_rules")
        if "ix_availability_rules_id" in rule_indexes:
            op.drop_index("ix_availability_rules_id", table_name="availability_rules")
        op.drop_table("availability_rules")
