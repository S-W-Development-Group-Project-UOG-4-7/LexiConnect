"""add case_documents table

Revision ID: b519bac94696
Revises: 2823cfaf8c53
Create Date: 2025-12-31 13:33:01.679041

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b519bac94696'
down_revision: Union[str, None] = '2823cfaf8c53'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'case_documents',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('case_id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('stored_path', sa.String(), nullable=False),
        sa.Column('mime_type', sa.String(length=255), nullable=True),
        sa.Column('size_bytes', sa.Integer(), nullable=True),
        sa.Column('uploaded_by_user_id', sa.Integer(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_case_documents_case_id', 'case_documents', ['case_id'])


def downgrade() -> None:
    op.drop_index('ix_case_documents_case_id', table_name='case_documents')
    op.drop_table('case_documents')

















