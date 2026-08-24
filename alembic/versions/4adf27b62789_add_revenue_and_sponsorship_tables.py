"""add revenue and sponsorship tables

Revision ID: 4adf27b62789
Revises:
Create Date: 2026-08-24
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4adf27b62789"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create revenue and sponsorship tables."""

    op.create_table(
        "revenue",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("creator_id", sa.Integer(), nullable=False),
        sa.Column("source", sa.String(length=100), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        "ix_revenue_id",
        "revenue",
        ["id"],
        unique=False
    )

    op.create_index(
        "ix_revenue_creator_id",
        "revenue",
        ["creator_id"],
        unique=False
    )

    op.create_table(
        "sponsorships",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("creator_id", sa.Integer(), nullable=False),
        sa.Column("brand_name", sa.String(length=150), nullable=False),
        sa.Column("campaign", sa.String(length=255), nullable=False),
        sa.Column("contract_value", sa.Float(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("payment_status", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        "ix_sponsorships_id",
        "sponsorships",
        ["id"],
        unique=False
    )

    op.create_index(
        "ix_sponsorships_creator_id",
        "sponsorships",
        ["creator_id"],
        unique=False
    )


def downgrade() -> None:
    """Remove revenue and sponsorship tables."""

    op.drop_index(
        "ix_sponsorships_creator_id",
        table_name="sponsorships"
    )

    op.drop_index(
        "ix_sponsorships_id",
        table_name="sponsorships"
    )

    op.drop_table("sponsorships")

    op.drop_index(
        "ix_revenue_creator_id",
        table_name="revenue"
    )

    op.drop_index(
        "ix_revenue_id",
        table_name="revenue"
    )

    op.drop_table("revenue")