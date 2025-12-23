"""vithana_availability_blackouts_queue

Revision ID: b1a2c3d4e5f6
Revises: fa3dcfa324d9
Create Date: 2025-12-18 00:05:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "b1a2c3d4e5f6"
down_revision: Union[str, None] = "fa3dcfa324d9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "availability_templates",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lawyer_id", sa.Integer(), nullable=False),
        sa.Column("day_of_week", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("slot_minutes", sa.Integer(), server_default=sa.text("30"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_availability_templates_day_of_week"), "availability_templates", ["day_of_week"], unique=False)
    op.create_index(op.f("ix_availability_templates_lawyer_id"), "availability_templates", ["lawyer_id"], unique=False)

    op.create_table(
        "blackout_days",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lawyer_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("lawyer_id", "date", name="uq_blackout_days_lawyer_date"),
    )
    op.create_index(op.f("ix_blackout_days_date"), "blackout_days", ["date"], unique=False)
    op.create_index(op.f("ix_blackout_days_lawyer_id"), "blackout_days", ["lawyer_id"], unique=False)

    op.create_table(
        "token_queue",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("token_number", sa.Integer(), nullable=False),
        sa.Column("lawyer_id", sa.Integer(), nullable=False),
        sa.Column("client_id", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("waiting", "served", name="token_queue_status"),
            nullable=False,
        ),
        sa.Column("served_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["client_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "lawyer_id",
            "date",
            "token_number",
            name="uq_token_queue_lawyer_date_token_number",
        ),
    )
    op.create_index(op.f("ix_token_queue_client_id"), "token_queue", ["client_id"], unique=False)
    op.create_index(op.f("ix_token_queue_date"), "token_queue", ["date"], unique=False)
    op.create_index(op.f("ix_token_queue_lawyer_id"), "token_queue", ["lawyer_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_token_queue_lawyer_id"), table_name="token_queue")
    op.drop_index(op.f("ix_token_queue_date"), table_name="token_queue")
    op.drop_index(op.f("ix_token_queue_client_id"), table_name="token_queue")
    op.drop_table("token_queue")

    op.drop_index(op.f("ix_blackout_days_lawyer_id"), table_name="blackout_days")
    op.drop_index(op.f("ix_blackout_days_date"), table_name="blackout_days")
    op.drop_table("blackout_days")

    op.drop_index(op.f("ix_availability_templates_lawyer_id"), table_name="availability_templates")
    op.drop_index(op.f("ix_availability_templates_day_of_week"), table_name="availability_templates")
    op.drop_table("availability_templates")
