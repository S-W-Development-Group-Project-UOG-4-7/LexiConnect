"""create intake_forms table

Revision ID: 66a6695a0865
Revises: 38c90343d511
Create Date: 2025-12-25 23:30:18.727586

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '66a6695a0865'
down_revision: Union[str, None] = '38c90343d511'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'intake_forms',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column(
            'booking_id',
            sa.Integer(),
            sa.ForeignKey('bookings.id', ondelete='CASCADE'),
            nullable=False,
        ),
        sa.Column('client_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_intake_forms_booking_id', 'intake_forms', ['booking_id'])


def downgrade() -> None:
    op.drop_index('ix_intake_forms_booking_id', table_name='intake_forms')
    op.drop_table('intake_forms')

















