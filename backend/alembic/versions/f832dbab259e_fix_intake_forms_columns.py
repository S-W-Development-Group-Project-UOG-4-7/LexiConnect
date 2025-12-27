"""fix intake_forms columns

Revision ID: f832dbab259e
Revises: 2b67d061365b
Create Date: 2025-12-27 03:46:55.641141

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f832dbab259e'
down_revision: Union[str, None] = '2b67d061365b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # add new columns (nullable first to avoid issues if table already has rows)
    op.add_column("intake_forms", sa.Column("case_type", sa.String(100), nullable=True))
    op.add_column("intake_forms", sa.Column("subject", sa.String(255), nullable=True))
    op.add_column("intake_forms", sa.Column("details", sa.Text(), nullable=True))
    op.add_column("intake_forms", sa.Column("urgency", sa.String(50), nullable=True))
    op.add_column("intake_forms", sa.Column("answers_json", sa.JSON(), nullable=True))

    # OPTIONAL: copy old answers -> answers_json if old column exists
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'intake_forms'
                  AND column_name = 'answers'
            ) THEN
                UPDATE intake_forms
                SET answers_json = answers
                WHERE answers_json IS NULL;
            END IF;
        END $$;
    """)

    # drop old column "answers" if it exists
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'intake_forms'
                  AND column_name = 'answers'
            ) THEN
                ALTER TABLE intake_forms DROP COLUMN answers;
            END IF;
        END $$;
    """)

    # if you're sure there are no existing rows, you can enforce NOT NULL now.
    # If there ARE existing rows, keep them nullable or backfill first.
    # op.alter_column("intake_forms", "case_type", nullable=False)
    # op.alter_column("intake_forms", "subject", nullable=False)
    # op.alter_column("intake_forms", "details", nullable=False)
    # op.alter_column("intake_forms", "urgency", nullable=False)



def downgrade():
    # recreate old answers column (optional)
    op.add_column("intake_forms", sa.Column("answers", sa.JSON(), nullable=True))

    op.drop_column("intake_forms", "answers_json")
    op.drop_column("intake_forms", "urgency")
    op.drop_column("intake_forms", "details")
    op.drop_column("intake_forms", "subject")
    op.drop_column("intake_forms", "case_type")











