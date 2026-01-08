"""apprenticeship assignments and notes

Revision ID: a97c36962ff8
Revises: 94a364d25227
Create Date: 2026-01-08 12:28:17.530911
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a97c36962ff8"
down_revision: Union[str, None] = "94a364d25227"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1) case_apprentices (assign apprentice to a case)
    op.create_table(
        "case_apprentices",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("case_id", sa.Integer(), nullable=False),
        sa.Column("lawyer_id", sa.Integer(), nullable=False),
        sa.Column("apprentice_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),

        sa.ForeignKeyConstraint(["case_id"], ["cases.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lawyer_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["apprentice_id"], ["users.id"], ondelete="CASCADE"),

        sa.UniqueConstraint("case_id", "apprentice_id", name="uq_case_apprentices_case_apprentice"),
    )

    op.create_index("ix_case_apprentices_case_id", "case_apprentices", ["case_id"], unique=False)
    op.create_index("ix_case_apprentices_lawyer_id", "case_apprentices", ["lawyer_id"], unique=False)
    op.create_index("ix_case_apprentices_apprentice_id", "case_apprentices", ["apprentice_id"], unique=False)

    # 2) apprentice_case_notes (apprentice writes internal notes)
    op.create_table(
        "apprentice_case_notes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("case_id", sa.Integer(), nullable=False),
        sa.Column("apprentice_id", sa.Integer(), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),

        sa.ForeignKeyConstraint(["case_id"], ["cases.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["apprentice_id"], ["users.id"], ondelete="CASCADE"),
    )

    op.create_index("ix_apprentice_case_notes_case_id", "apprentice_case_notes", ["case_id"], unique=False)
    op.create_index("ix_apprentice_case_notes_apprentice_id", "apprentice_case_notes", ["apprentice_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_apprentice_case_notes_apprentice_id", table_name="apprentice_case_notes")
    op.drop_index("ix_apprentice_case_notes_case_id", table_name="apprentice_case_notes")
    op.drop_table("apprentice_case_notes")

    op.drop_index("ix_case_apprentices_apprentice_id", table_name="case_apprentices")
    op.drop_index("ix_case_apprentices_lawyer_id", table_name="case_apprentices")
    op.drop_index("ix_case_apprentices_case_id", table_name="case_apprentices")
    op.drop_table("case_apprentices")
