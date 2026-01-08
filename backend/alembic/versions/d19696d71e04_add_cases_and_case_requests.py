"""add cases and case_requests

Revision ID: d19696d71e04
Revises: 0e3f9c3a2b1c
Create Date: 2025-12-31 00:17:06.570543
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "d19696d71e04"
down_revision: Union[str, None] = "0e3f9c3a2b1c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)

    tables = set(insp.get_table_names())

    # If bookings doesn't exist yet, nothing to do
    if "bookings" not in tables:
        return

    # ---- 1) Add bookings.case_id if missing ----
    booking_cols = {c["name"] for c in insp.get_columns("bookings")}
    if "case_id" not in booking_cols:
        op.add_column("bookings", sa.Column("case_id", sa.Integer(), nullable=True))

    # Re-inspect after possible DDL
    insp = inspect(bind)

    # ---- 2) Add index if missing ----
    existing_indexes = {ix["name"] for ix in insp.get_indexes("bookings")}
    if "ix_bookings_case_id" not in existing_indexes:
        op.create_index("ix_bookings_case_id", "bookings", ["case_id"], unique=False)

    # ---- 3) Add FK only if `cases` exists ----
    tables = set(insp.get_table_names())
    if "cases" not in tables:
        # cases table is created later in your migration chain, so skip FK for now
        return

    # Avoid duplicate FK creation
    existing_fks = {fk.get("name") for fk in insp.get_foreign_keys("bookings")}
    if "fk_bookings_case" not in existing_fks:
        op.create_foreign_key(
            "fk_bookings_case",
            "bookings",
            "cases",
            ["case_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)

    if "bookings" not in insp.get_table_names():
        return

    # Drop FK if it exists (by our explicit name)
    existing_fks = {fk.get("name") for fk in insp.get_foreign_keys("bookings")}
    if "fk_bookings_case" in existing_fks:
        op.drop_constraint("fk_bookings_case", "bookings", type_="foreignkey")

    # Drop index if it exists
    existing_indexes = {ix["name"] for ix in insp.get_indexes("bookings")}
    if "ix_bookings_case_id" in existing_indexes:
        op.drop_index("ix_bookings_case_id", table_name="bookings")

    # Drop column if it exists
    booking_cols = {c["name"] for c in insp.get_columns("bookings")}
    if "case_id" in booking_cols:
        op.drop_column("bookings", "case_id")
