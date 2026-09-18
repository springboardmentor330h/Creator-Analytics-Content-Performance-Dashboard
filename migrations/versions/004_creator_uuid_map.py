"""Add UUID creator mapping to Sprint 6 financial tables

Revision ID: 004_creator_uuid_map
Revises: 003_notifications_sprint7
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "004_creator_uuid_map"
down_revision = "003_notifications_sprint7"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "revenue",
        sa.Column(
            "creator_uuid",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )

    op.add_column(
        "sponsorships",
        sa.Column(
            "creator_uuid",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_revenue_creator_uuid",
        "revenue",
        ["creator_uuid"],
    )

    op.create_index(
        "ix_sponsorship_creator_uuid",
        "sponsorships",
        ["creator_uuid"],
    )


def downgrade():
    op.drop_index(
        "ix_sponsorship_creator_uuid",
        table_name="sponsorships",
    )

    op.drop_index(
        "ix_revenue_creator_uuid",
        table_name="revenue",
    )

    op.drop_column("sponsorships", "creator_uuid")
    op.drop_column("revenue", "creator_uuid")
