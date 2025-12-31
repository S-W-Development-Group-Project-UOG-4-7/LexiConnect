from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "7798cb991828"
down_revision = "add_documents_table"
branch_labels = None
depends_on = None

def upgrade() -> None:
    bind = op.get_bind()
    exists = bind.execute(
        sa.text("""
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema='public'
                  AND table_name='documents'
                  AND column_name='title'
            )
        """)
    ).scalar()

    if exists:
        return

    op.add_column("documents", sa.Column("title", sa.String(length=255), nullable=True))

def downgrade() -> None:
    # Only drop if it exists
    bind = op.get_bind()
    exists = bind.execute(
        sa.text("""
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema='public'
                  AND table_name='documents'
                  AND column_name='title'
            )
        """)
    ).scalar()

    if not exists:
        return

    op.drop_column("documents", "title")
