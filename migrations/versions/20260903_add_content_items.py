"""add unified content_items table

Revision ID: 20260903_content_items
Revises:
Create Date: 2026-09-03
"""

from alembic import op
import sqlalchemy as sa

revision = "20260903_content_items"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "content_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("platform", sa.String(length=32), nullable=False),
        sa.Column("content_id", sa.String(length=255), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("url", sa.String(length=2048), nullable=True),
        sa.Column("views", sa.BigInteger(), nullable=False, server_default="0"),
        sa.Column("likes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("comments", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("shares", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reach", sa.BigInteger(), nullable=False, server_default="0"),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("platform", "content_id", name="uq_content_items_platform_content_id"),
    )
    op.create_index("ix_content_items_platform", "content_items", ["platform"])
    op.create_index("ix_content_items_published_at", "content_items", ["published_at"])


def downgrade():
    op.drop_index("ix_content_items_published_at", table_name="content_items")
    op.drop_index("ix_content_items_platform", table_name="content_items")
    op.drop_table("content_items")
