"""add fk checklist_templates.service_package_id

Revision ID: <YOUR_NEW_REVISION_ID>
Revises: 94a364d25227
"""

from typing import Sequence, Union
from alembic import op
from sqlalchemy import inspect


revision: str = "79b6599a1b18"
down_revision: Union[str, None] = "94a364d25227"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)

    tables = set(insp.get_table_names())
    if "checklist_templates" not in tables or "service_packages" not in tables:
        return

    existing_fks = {fk.get("name") for fk in insp.get_foreign_keys("checklist_templates")}
    if "fk_checklist_templates_service_package_id" not in existing_fks:
        op.create_foreign_key(
            "fk_checklist_templates_service_package_id",
            "checklist_templates",
            "service_packages",
            ["service_package_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    op.drop_constraint(
        "fk_checklist_templates_service_package_id",
        "checklist_templates",
        type_="foreignkey",
    )
