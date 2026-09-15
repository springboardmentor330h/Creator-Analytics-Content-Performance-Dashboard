"""Sprint 6 revenue analytics indexes

Revision ID: 002_revenue_sprint6
Revises: 001_creatoriq_tables
"""

from alembic import op


revision = "002_revenue_sprint6"
down_revision = "001_creatoriq_tables"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_revenue_creator_date "
        "ON revenue (creator_id, received_date)"
    )

    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_revenue_creator_source "
        "ON revenue (creator_id, source)"
    )

    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_sponsorship_creator_status "
        "ON sponsorships (creator_id, status)"
    )

    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_sponsorship_creator_payment "
        "ON sponsorships (creator_id, payment_status)"
    )


def downgrade():
    op.execute(
        "DROP INDEX IF EXISTS ix_revenue_creator_date"
    )

    op.execute(
        "DROP INDEX IF EXISTS ix_revenue_creator_source"
    )

    op.execute(
        "DROP INDEX IF EXISTS ix_sponsorship_creator_status"
    )

    op.execute(
        "DROP INDEX IF EXISTS ix_sponsorship_creator_payment"
    )
