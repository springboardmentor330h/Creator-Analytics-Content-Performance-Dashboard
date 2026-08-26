"""create sponsorships table

Revision ID: 34ac0080776f
Revises: 272357dd4e92
Create Date: 2026-08-25 17:05:20.733925

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "34ac0080776f"
down_revision: Union[str, Sequence[str], None] = "272357dd4e92"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "sponsorships",
        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            nullable=False
        ),
        sa.Column(
            "creator_id",
            sa.Integer(),
            nullable=False
        ),
        sa.Column(
            "brand_name",
            sa.String(),
            nullable=False
        ),
        sa.Column(
            "campaign",
            sa.String(),
            nullable=False
        ),
        sa.Column(
            "contract_value",
            sa.Float(),
            nullable=False
        ),
        sa.Column(
            "start_date",
            sa.Date(),
            nullable=False
        ),
        sa.Column(
            "end_date",
            sa.Date(),
            nullable=False
        ),
        sa.Column(
            "status",
            sa.String(),
            nullable=False,
            server_default="Active"
        ),
        sa.Column(
            "payment_status",
            sa.String(),
            nullable=False,
            server_default="Pending"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False
        ),
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
    pass