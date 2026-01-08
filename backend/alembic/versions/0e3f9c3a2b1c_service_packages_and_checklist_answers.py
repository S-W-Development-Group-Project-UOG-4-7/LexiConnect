"""Add service_package FK to bookings and booking checklist answers table

Revision ID: 0e3f9c3a2b1c
Revises: 6d20843f1363
Create Date: 2026-01-05 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "0e3f9c3a2b1c"
down_revision: Union[str, None] = "6d20843f1363"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)
    tables = set(insp.get_table_names())

    # ------------------------------------------------------------------
    # 1) Ensure service_packages exists (some older migrations only had it in DOWNGRADE)
    # ------------------------------------------------------------------
    if "service_packages" not in tables:
        op.create_table(
            "service_packages",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("lawyer_id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
            sa.Column("duration", sa.Integer(), nullable=True),
            sa.Column("active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"], ondelete="CASCADE"),
        )
        op.create_index("ix_service_packages_id", "service_packages", ["id"])

        # refresh table list
        tables = set(insp.get_table_names())

    # ------------------------------------------------------------------
    # 2) Ensure checklist_templates exists (also seen only in DOWNGRADE in some histories)
    #    Include input_type + is_active here to avoid later add_column conflicts.
    # ------------------------------------------------------------------
    if "checklist_templates" not in tables:
        op.create_table(
            "checklist_templates",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("lawyer_id", sa.Integer(), nullable=False),
            sa.Column("question", sa.String(length=500), nullable=False),
            sa.Column("helper_text", sa.String(length=500), nullable=True),
            sa.Column("required", sa.Boolean(), server_default=sa.text("false"), nullable=False),
            sa.Column("input_type", sa.String(length=50), server_default="text", nullable=False),
            sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"], ondelete="CASCADE"),
        )
        op.create_index("ix_checklist_templates_id", "checklist_templates", ["id"])

        # refresh table list
        tables = set(insp.get_table_names())

    # ------------------------------------------------------------------
    # 3) Add service_package_id to bookings + FK to service_packages
    # ------------------------------------------------------------------
    if "bookings" in tables:
        booking_cols = {c["name"] for c in insp.get_columns("bookings")}

        if "service_package_id" not in booking_cols:
            op.add_column("bookings", sa.Column("service_package_id", sa.Integer(), nullable=True))

        # index (safe-create)
        existing_booking_indexes = {ix["name"] for ix in insp.get_indexes("bookings")}
        if "ix_bookings_service_package_id" not in existing_booking_indexes:
            op.create_index(
                "ix_bookings_service_package_id",
                "bookings",
                ["service_package_id"],
                unique=False,
            )

        # fk (safe-create)
        existing_fks = {fk["name"] for fk in insp.get_foreign_keys("bookings")}
        if "fk_bookings_service_package_id" not in existing_fks:
            op.create_foreign_key(
                "fk_bookings_service_package_id",
                "bookings",
                "service_packages",
                ["service_package_id"],
                ["id"],
                ondelete="SET NULL",
            )

    # ------------------------------------------------------------------
    # 4) booking_checklist_answers table
    # ------------------------------------------------------------------
    if "booking_checklist_answers" not in tables:
        op.create_table(
            "booking_checklist_answers",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("booking_id", sa.Integer(), nullable=False),
            sa.Column("template_id", sa.Integer(), nullable=False),
            sa.Column("answer_text", sa.Text(), nullable=True),
            sa.Column("document_id", sa.Integer(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["template_id"], ["checklist_templates.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="SET NULL"),
            sa.UniqueConstraint("booking_id", "template_id", name="uq_booking_template_answer"),
        )
        op.create_index("ix_booking_checklist_answers_booking_id", "booking_checklist_answers", ["booking_id"])
        op.create_index("ix_booking_checklist_answers_template_id", "booking_checklist_answers", ["template_id"])
        op.create_index("ix_booking_checklist_answers_document_id", "booking_checklist_answers", ["document_id"])


def downgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)
    tables = set(insp.get_table_names())

    if "booking_checklist_answers" in tables:
        op.drop_index("ix_booking_checklist_answers_document_id", table_name="booking_checklist_answers")
        op.drop_index("ix_booking_checklist_answers_template_id", table_name="booking_checklist_answers")
        op.drop_index("ix_booking_checklist_answers_booking_id", table_name="booking_checklist_answers")
        op.drop_table("booking_checklist_answers")

    if "bookings" in tables:
        # drop fk if exists
        fks = {fk["name"] for fk in insp.get_foreign_keys("bookings")}
        if "fk_bookings_service_package_id" in fks:
            op.drop_constraint("fk_bookings_service_package_id", "bookings", type_="foreignkey")

        indexes = {ix["name"] for ix in insp.get_indexes("bookings")}
        if "ix_bookings_service_package_id" in indexes:
            op.drop_index("ix_bookings_service_package_id", table_name="bookings")

        cols = {c["name"] for c in insp.get_columns("bookings")}
        if "service_package_id" in cols:
            op.drop_column("bookings", "service_package_id")

    # NOTE: We do NOT drop service_packages/checklist_templates in downgrade here
    # because other parts of your app likely depend on them.
