"""Add lawyer availability tables

Revision ID: add_lawyer_availability
Revises: initial
Create Date: 2025-12-25 16:52:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_lawyer_availability'
down_revision = 'initial'
branch_labels = None
depends_on = None


def upgrade():
    # Create weekly_availability table
    op.create_table('weekly_availability',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lawyer_id', sa.Integer(), nullable=False),
        sa.Column('branch_id', sa.Integer(), nullable=False),
        sa.Column('day_of_week', sa.Enum('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', name='weekday'), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('max_bookings', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['branch_id'], ['branches.id'], ),
        sa.ForeignKeyConstraint(['lawyer_id'], ['lawyers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_weekly_availability_id'), 'weekly_availability', ['id'], unique=False)
    op.create_index(op.f('ix_weekly_availability_lawyer_id'), 'weekly_availability', ['lawyer_id'], unique=False)
    op.create_index(op.f('ix_weekly_availability_branch_id'), 'weekly_availability', ['branch_id'], unique=False)
    op.create_index(op.f('ix_weekly_availability_day_of_week'), 'weekly_availability', ['day_of_week'], unique=False)

    # Create blackout_dates table
    op.create_table('blackout_dates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lawyer_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('availability_type', sa.String(length=20), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=True),
        sa.Column('end_time', sa.Time(), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['lawyer_id'], ['lawyers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_blackout_dates_id'), 'blackout_dates', ['id'], unique=False)
    op.create_index(op.f('ix_blackout_dates_lawyer_id'), 'blackout_dates', ['lawyer_id'], unique=False)
    op.create_index(op.f('ix_blackout_dates_date'), 'blackout_dates', ['date'], unique=False)

    # Create availability_exceptions table
    op.create_table('availability_exceptions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lawyer_id', sa.Integer(), nullable=False),
        sa.Column('weekly_availability_id', sa.Integer(), nullable=False),
        sa.Column('exception_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('override_start_time', sa.Time(), nullable=True),
        sa.Column('override_end_time', sa.Time(), nullable=True),
        sa.Column('override_max_bookings', sa.Integer(), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['lawyer_id'], ['lawyers.id'], ),
        sa.ForeignKeyConstraint(['weekly_availability_id'], ['weekly_availability.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_availability_exceptions_id'), 'availability_exceptions', ['id'], unique=False)
    op.create_index(op.f('ix_availability_exceptions_lawyer_id'), 'availability_exceptions', ['lawyer_id'], unique=False)
    op.create_index(op.f('ix_availability_exceptions_exception_date'), 'availability_exceptions', ['exception_date'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_availability_exceptions_exception_date'), table_name='availability_exceptions')
    op.drop_index(op.f('ix_availability_exceptions_lawyer_id'), table_name='availability_exceptions')
    op.drop_index(op.f('ix_availability_exceptions_id'), table_name='availability_exceptions')
    op.drop_table('availability_exceptions')
    op.drop_index(op.f('ix_blackout_dates_date'), table_name='blackout_dates')
    op.drop_index(op.f('ix_blackout_dates_lawyer_id'), table_name='blackout_dates')
    op.drop_index(op.f('ix_blackout_dates_id'), table_name='blackout_dates')
    op.drop_table('blackout_dates')
    op.drop_index(op.f('ix_weekly_availability_day_of_week'), table_name='weekly_availability')
    op.drop_index(op.f('ix_weekly_availability_branch_id'), table_name='weekly_availability')
    op.drop_index(op.f('ix_weekly_availability_lawyer_id'), table_name='weekly_availability')
    op.drop_index(op.f('ix_weekly_availability_id'), table_name='weekly_availability')
    op.drop_table('weekly_availability')
    op.execute('DROP TYPE IF EXISTS weekday')
