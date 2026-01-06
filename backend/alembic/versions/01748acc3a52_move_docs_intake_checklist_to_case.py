"""move docs intake checklist to case

Revision ID: 01748acc3a52
Revises: f39e5b575deb
Create Date: 2025-12-31 02:23:04.484144

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '01748acc3a52'
down_revision: Union[str, None] = 'f39e5b575deb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1) Add case_id columns (nullable for safety)
    op.add_column("documents", sa.Column("case_id", sa.Integer(), nullable=True))
    op.add_column("intake_forms", sa.Column("case_id", sa.Integer(), nullable=True))
    op.add_column("booking_checklist_answers", sa.Column("case_id", sa.Integer(), nullable=True))

    # 2) Add foreign keys
    op.create_foreign_key(
        "fk_documents_case", "documents", "cases", ["case_id"], ["id"], ondelete="CASCADE"
    )
    op.create_foreign_key(
        "fk_intake_forms_case", "intake_forms", "cases", ["case_id"], ["id"], ondelete="CASCADE"
    )
    op.create_foreign_key(
        "fk_booking_checklist_answers_case",
        "booking_checklist_answers",
        "cases",
        ["case_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # 3) Indexes
    op.create_index("ix_documents_case_id", "documents", ["case_id"])
    op.create_index("ix_intake_forms_case_id", "intake_forms", ["case_id"])
    op.create_index("ix_booking_checklist_answers_case_id", "booking_checklist_answers", ["case_id"])

    # 4) Backfill case_id from bookings.case_id
    op.execute("""
        UPDATE documents d
        SET case_id = b.case_id
        FROM bookings b
        WHERE d.booking_id = b.id
          AND d.case_id IS NULL
          AND b.case_id IS NOT NULL;
    """)

    op.execute("""
        UPDATE intake_forms f
        SET case_id = b.case_id
        FROM bookings b
        WHERE f.booking_id = b.id
          AND f.case_id IS NULL
          AND b.case_id IS NOT NULL;
    """)

    op.execute("""
        UPDATE booking_checklist_answers a
        SET case_id = b.case_id
        FROM bookings b
        WHERE a.booking_id = b.id
          AND a.case_id IS NULL
          AND b.case_id IS NOT NULL;
    """)


def downgrade():
    op.drop_index("ix_booking_checklist_answers_case_id", table_name="booking_checklist_answers")
    op.drop_index("ix_intake_forms_case_id", table_name="intake_forms")
    op.drop_index("ix_documents_case_id", table_name="documents")

    op.drop_constraint("fk_booking_checklist_answers_case", "booking_checklist_answers", type_="foreignkey")
    op.drop_constraint("fk_intake_forms_case", "intake_forms", type_="foreignkey")
    op.drop_constraint("fk_documents_case", "documents", type_="foreignkey")

    op.drop_column("booking_checklist_answers", "case_id")
    op.drop_column("intake_forms", "case_id")
    op.drop_column("documents", "case_id")















