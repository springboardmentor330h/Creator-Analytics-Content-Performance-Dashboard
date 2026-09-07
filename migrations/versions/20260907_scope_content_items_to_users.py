"""scope unified content items to their creator

Revision ID: 20260907_scope_content_items
Revises: 20260903_content_items
"""

from alembic import op
import sqlalchemy as sa


revision = "20260907_scope_content_items"
down_revision = "20260903_content_items"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("content_items", sa.Column("creator_id", sa.Integer(), nullable=True))
    op.execute("UPDATE content_items SET creator_id = 1 WHERE creator_id IS NULL")
    op.alter_column("content_items", "creator_id", nullable=False)
    op.create_index("ix_content_items_creator_id", "content_items", ["creator_id"])
    op.create_foreign_key("fk_content_items_creator_id_users", "content_items", "users", ["creator_id"], ["id"])
    op.drop_constraint("uq_content_items_platform_content_id", "content_items", type_="unique")
    op.create_unique_constraint(
        "uq_content_items_creator_platform_content_id",
        "content_items",
        ["creator_id", "platform", "content_id"],
    )


def downgrade():
    op.drop_constraint("uq_content_items_creator_platform_content_id", "content_items", type_="unique")
    op.create_unique_constraint(
        "uq_content_items_platform_content_id",
        "content_items",
        ["platform", "content_id"],
    )
    op.drop_constraint("fk_content_items_creator_id_users", "content_items", type_="foreignkey")
    op.drop_index("ix_content_items_creator_id", table_name="content_items")
    op.drop_column("content_items", "creator_id")