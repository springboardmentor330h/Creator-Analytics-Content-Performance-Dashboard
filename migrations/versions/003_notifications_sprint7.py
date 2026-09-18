"""Add Sprint 7 notification fields

Revision ID: 003_notifications_sprint7
Revises: 002_revenue_sprint6
"""

from alembic import op
import sqlalchemy as sa


revision = "003_notifications_sprint7"
down_revision = "002_revenue_sprint6"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "notifications",
        sa.Column(
            "is_read",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.add_column(
        "notifications",
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_index(
        "ix_notifications_creator_read",
        "notifications",
        ["creator_id", "is_read"],
    )

    op.create_index(
        "ix_notifications_creator_created",
        "notifications",
        ["creator_id", "created_at"],
    )


def downgrade():
    op.drop_index(
        "ix_notifications_creator_created",
        table_name="notifications",
    )

    op.drop_index(
        "ix_notifications_creator_read",
        table_name="notifications",
    )

    op.drop_column("notifications", "created_at")
    op.drop_column("notifications", "is_read")
