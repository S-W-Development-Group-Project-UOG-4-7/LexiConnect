"""Add service_package FK to bookings and booking checklist answers table

Revision ID: 0e3f9c3a2b1c
Revises: 6d20843f1363
Create Date: 2026-01-05 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0e3f9c3a2b1c"
down_revision: Union[str, None] = "6d20843f1363"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add service_package_id to bookings
    op.add_column(
        "bookings",
        sa.Column("service_package_id", sa.Integer(), nullable=True),
    )
    op.create_index(
        "ix_bookings_service_package_id",
        "bookings",
        ["service_package_id"],
        unique=False,
    )
    op.create_foreign_key(
        "fk_bookings_service_package_id",
        "bookings",
        "service_packages",
        ["service_package_id"],
        ["id"],
    )

    # Checklist template additions
    op.add_column(
        "checklist_templates",
        sa.Column("input_type", sa.String(), nullable=False, server_default="text"),
    )
    op.add_column(
        "checklist_templates",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.alter_column(
        "checklist_templates",
        "input_type",
        server_default=None,
    )

    # Booking checklist answers table
    op.create_table(
        "booking_checklist_answers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_id", sa.Integer(), nullable=False, index=True),
        sa.Column("template_id", sa.Integer(), nullable=False, index=True),
        sa.Column("answer_text", sa.Text(), nullable=True),
        sa.Column("document_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["booking_id"],
            ["bookings.id"],
            ondelete="CASCADE",
            name="fk_booking_checklist_answers_booking_id",
        ),
        sa.ForeignKeyConstraint(
            ["template_id"],
            ["checklist_templates.id"],
            ondelete="CASCADE",
            name="fk_booking_checklist_answers_template_id",
        ),
        sa.ForeignKeyConstraint(
            ["document_id"],
            ["documents.id"],
            ondelete="SET NULL",
            name="fk_booking_checklist_answers_document_id",
        ),
        sa.UniqueConstraint(
            "booking_id",
            "template_id",
            name="uq_booking_template_answer",
        ),
    )
    op.create_index(
        "ix_booking_checklist_answers_booking_id",
        "booking_checklist_answers",
        ["booking_id"],
        unique=False,
    )
    op.create_index(
        "ix_booking_checklist_answers_template_id",
        "booking_checklist_answers",
        ["template_id"],
        unique=False,
    )
    op.create_index(
        "ix_booking_checklist_answers_document_id",
        "booking_checklist_answers",
        ["document_id"],
        unique=False,
    )


def downgrade() -> None:
    # Drop booking_checklist_answers
    op.drop_index("ix_booking_checklist_answers_document_id", table_name="booking_checklist_answers")
    op.drop_index("ix_booking_checklist_answers_template_id", table_name="booking_checklist_answers")
    op.drop_index("ix_booking_checklist_answers_booking_id", table_name="booking_checklist_answers")
    op.drop_table("booking_checklist_answers")

    # Checklist template removals
    op.drop_column("checklist_templates", "is_active")
    op.drop_column("checklist_templates", "input_type")

    # Remove service_package_id from bookings
    op.drop_constraint("fk_bookings_service_package_id", "bookings", type_="foreignkey")
    op.drop_index("ix_bookings_service_package_id", table_name="bookings")
    op.drop_column("bookings", "service_package_id")
