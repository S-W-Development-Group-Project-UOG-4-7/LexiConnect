"""add uploaded_by_user_id to documents

Revision ID: d3cdeccdcef0
Revises: 6e9ecc0c8434
Create Date: 2026-01-22 11:16:24.419268

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd3cdeccdcef0'
down_revision: Union[str, None] = '6e9ecc0c8434'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(bind, table: str, column: str) -> bool:
    q = sa.text("""
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema='public'
          AND table_name=:t
          AND column_name=:c
        LIMIT 1
    """)
    return bind.execute(q, {"t": table, "c": column}).scalar() is not None


def _constraint_exists(bind, name: str) -> bool:
    q = sa.text("""
        SELECT 1
        FROM pg_constraint
        WHERE conname=:n
        LIMIT 1
    """)
    return bind.execute(q, {"n": name}).scalar() is not None


def _index_exists(bind, name: str) -> bool:
    q = sa.text("""
        SELECT 1
        FROM pg_indexes
        WHERE schemaname='public'
          AND indexname=:n
        LIMIT 1
    """)
    return bind.execute(q, {"n": name}).scalar() is not None


def upgrade():
    bind = op.get_bind()

    # 1) column
    if not _column_exists(bind, "documents", "uploaded_by_user_id"):
        op.add_column("documents", sa.Column("uploaded_by_user_id", sa.Integer(), nullable=True))

    # 2) FK
    fk_name = "documents_uploaded_by_user_id_fkey"
    if not _constraint_exists(bind, fk_name):
        op.create_foreign_key(
            fk_name,
            "documents",
            "users",
            ["uploaded_by_user_id"],
            ["id"],
            ondelete="SET NULL",
        )

    # 3) index
    idx_name = "ix_documents_uploaded_by_user_id"
    if not _index_exists(bind, idx_name):
        op.create_index(idx_name, "documents", ["uploaded_by_user_id"], unique=False)


def downgrade():
    bind = op.get_bind()

    idx_name = "ix_documents_uploaded_by_user_id"
    fk_name = "documents_uploaded_by_user_id_fkey"

    if _index_exists(bind, idx_name):
        op.drop_index(idx_name, table_name="documents")

    if _constraint_exists(bind, fk_name):
        op.drop_constraint(fk_name, "documents", type_="foreignkey")

    if _column_exists(bind, "documents", "uploaded_by_user_id"):
        op.drop_column("documents", "uploaded_by_user_id")