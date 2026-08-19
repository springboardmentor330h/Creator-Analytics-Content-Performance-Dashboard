"""Add external content identifier to content records.

Revision ID: 8c1f6f4a2b7e
Revises: ffbffb21d18c
Create Date: 2026-08-19
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '8c1f6f4a2b7e'
down_revision: Union[str, Sequence[str], None] = 'ffbffb21d18c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('content', sa.Column('external_content_id', sa.String(length=150), nullable=True))
    op.create_index('ix_content_external_content_id', 'content', ['external_content_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_content_external_content_id', table_name='content')
    op.drop_column('content', 'external_content_id')
