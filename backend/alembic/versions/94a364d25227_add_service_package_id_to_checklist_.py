"""add service_package_id to checklist_templates

Revision ID: 94a364d25227
Revises: 3cdb5ff6a5de
Create Date: 2026-01-08 11:22:26.603684
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "94a364d25227"
down_revision: Union[str, None] = "3cdb5ff6a5de"
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

    # checklist_templates must exist
    if not _table_exists(insp, "checklist_templates"):
        return

    # 1) Add column (nullable for safety)
    if not _column_exists(insp, "checklist_templates", "service_package_id"):
        op.add_column(
            "checklist_templates",
            sa.Column("service_package_id", sa.Integer(), nullable=True),
        )

    # 2) Index (safe)
    insp = inspect(bind)
    if not _index_exists(insp, "checklist_templates", "ix_checklist_templates_service_package_id"):
        op.create_index(
            "ix_checklist_templates_service_package_id",
            "checklist_templates",
            ["service_package_id"],
            unique=False,
        )

    # 3) FK only if service_packages table exists
    insp = inspect(bind)
    if _table_exists(insp, "service_packages"):
        if not _fk_exists(insp, "checklist_templates", "fk_checklist_templates_service_package_id"):
            op.create_foreign_key(
                "fk_checklist_templates_service_package_id",
                "checklist_templates",
                "service_packages",
                ["service_package_id"],
                ["id"],
                ondelete="SET NULL",
            )


def downgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)

    if not _table_exists(insp, "checklist_templates"):
        return

    # Drop FK if exists
    insp = inspect(bind)
    if _fk_exists(insp, "checklist_templates", "fk_checklist_templates_service_package_id"):
        op.drop_constraint(
            "fk_checklist_templates_service_package_id",
            "checklist_templates",
            type_="foreignkey",
        )

    # Drop index if exists
    insp = inspect(bind)
    if _index_exists(insp, "checklist_templates", "ix_checklist_templates_service_package_id"):
        op.drop_index(
            "ix_checklist_templates_service_package_id",
            table_name="checklist_templates",
        )

    # Drop column if exists
    insp = inspect(bind)
    if _column_exists(insp, "checklist_templates", "service_package_id"):
        op.drop_column("checklist_templates", "service_package_id")
