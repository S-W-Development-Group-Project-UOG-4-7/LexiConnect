"""move docs intake checklist to case

Revision ID: 01748acc3a52
Revises: 3a70ff1079e2   
Create Date: 2025-12-31 02:23:04.484144
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "01748acc3a52"
down_revision: Union[str, None] = "3a70ff1079e2"  # <-- keep this as the revision BEFORE this file
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(insp, name: str) -> bool:
    return name in set(insp.get_table_names())


def _column_exists(insp, table: str, col: str) -> bool:
    return col in {c["name"] for c in insp.get_columns(table)}


def _index_exists(insp, table: str, index_name: str) -> bool:
    return index_name in {ix["name"] for ix in insp.get_indexes(table)}


def _fk_exists(insp, table: str, fk_name: str) -> bool:
    return fk_name in {fk.get("name") for fk in insp.get_foreign_keys(table)}


def upgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)
    tables = set(insp.get_table_names())

    # If cases table doesn't exist yet, we can still add nullable case_id columns,
    # but we MUST skip FK creation (or it will crash).
    
    targets = [
        ("documents", "fk_documents_case", "ix_documents_case_id"),
        ("intake_forms", "fk_intake_forms_case", "ix_intake_forms_case_id"),
        ("booking_checklist_answers", "fk_booking_checklist_answers_case", "ix_booking_checklist_answers_case_id"),
    ]

    # 1) Add case_id columns (only if table exists AND column missing)
    for table_name, fk_name, ix_name in targets:
        insp = inspect(bind)
        if not _table_exists(insp, table_name):
            continue

        if not _column_exists(insp, table_name, "case_id"):
            op.add_column(table_name, sa.Column("case_id", sa.Integer(), nullable=True))

        # 2) Index (safe)
        insp = inspect(bind)
        if _table_exists(insp, table_name) and not _index_exists(insp, table_name, ix_name):
            op.create_index(ix_name, table_name, ["case_id"], unique=False)

    # 3) Foreign keys (ONLY if cases exists)
    cases_exists = _table_exists(inspect(bind), "cases")
    if cases_exists:
        for table_name, fk_name, ix_name in targets:
            insp = inspect(bind)
            if not _table_exists(insp, table_name):
                continue

            # only create FK if case_id column exists
            if not _column_exists(insp, table_name, "case_id"):
                continue

            if not _fk_exists(insp, table_name, fk_name):
                op.create_foreign_key(
                    fk_name,
                    table_name,
                    "cases",
                    ["case_id"],
                    ["id"],
                    ondelete="CASCADE",
                )

    # 4) Backfill case_id from bookings.case_id
    # Only do this if bookings exists and has case_id.
    insp = inspect(bind)
    if not _table_exists(insp, "bookings"):
        return
    if not _column_exists(insp, "bookings", "case_id"):
        return

    # documents backfill
    insp = inspect(bind)
    if _table_exists(insp, "documents") and _column_exists(insp, "documents", "booking_id") and _column_exists(insp, "documents", "case_id"):
        op.execute("""
            UPDATE documents d
            SET case_id = b.case_id
            FROM bookings b
            WHERE d.booking_id = b.id
              AND d.case_id IS NULL
              AND b.case_id IS NOT NULL;
        """)

    # intake_forms backfill
    insp = inspect(bind)
    if _table_exists(insp, "intake_forms") and _column_exists(insp, "intake_forms", "booking_id") and _column_exists(insp, "intake_forms", "case_id"):
        op.execute("""
            UPDATE intake_forms f
            SET case_id = b.case_id
            FROM bookings b
            WHERE f.booking_id = b.id
              AND f.case_id IS NULL
              AND b.case_id IS NOT NULL;
        """)

    # booking_checklist_answers backfill
    insp = inspect(bind)
    if _table_exists(insp, "booking_checklist_answers") and _column_exists(insp, "booking_checklist_answers", "booking_id") and _column_exists(insp, "booking_checklist_answers", "case_id"):
        op.execute("""
            UPDATE booking_checklist_answers a
            SET case_id = b.case_id
            FROM bookings b
            WHERE a.booking_id = b.id
              AND a.case_id IS NULL
              AND b.case_id IS NOT NULL;
        """)


def downgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)

    targets = [
        ("booking_checklist_answers", "fk_booking_checklist_answers_case", "ix_booking_checklist_answers_case_id"),
        ("intake_forms", "fk_intake_forms_case", "ix_intake_forms_case_id"),
        ("documents", "fk_documents_case", "ix_documents_case_id"),
    ]

    for table_name, fk_name, ix_name in targets:
        insp = inspect(bind)
        if not _table_exists(insp, table_name):
            continue

        # Drop index if exists
        if _index_exists(insp, table_name, ix_name):
            op.drop_index(ix_name, table_name=table_name)

        # Drop FK if exists
        insp = inspect(bind)
        if _fk_exists(insp, table_name, fk_name):
            op.drop_constraint(fk_name, table_name, type_="foreignkey")

        # Drop column if exists
        insp = inspect(bind)
        if _column_exists(insp, table_name, "case_id"):
            op.drop_column(table_name, "case_id")
