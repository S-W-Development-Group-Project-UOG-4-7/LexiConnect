from alembic import op
import sqlalchemy as sa

revision = "82b9323d0496"
down_revision = "92869b50be20"

def upgrade():
    bind = op.get_bind()

    # created_at
    exists = bind.execute(sa.text("""
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='branches' AND column_name='created_at'
    """)).scalar()

    if not exists:
        op.add_column(
            "branches",
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
        )

    # updated_at
    exists = bind.execute(sa.text("""
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='branches' AND column_name='updated_at'
    """)).scalar()

    if not exists:
        op.add_column(
            "branches",
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
        )

def downgrade():
    # downgrade can stay strict (usually fine)
    op.drop_column("branches", "updated_at")
    op.drop_column("branches", "created_at")
