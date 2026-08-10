"""Add creator/agency profile fields to users.

Revision ID: 0003_user_profile_fields
Revises: 0002_rename_password_column
Create Date: 2026-08-08
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = '0003_user_profile_fields'
down_revision: Union[str, Sequence[str], None] = '0002_rename_password_column'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

PROFILE_COLUMNS = [
    ('bio', sa.Text()),
    ('avatar_url', sa.String(length=500)),
    ('youtube_url', sa.String(length=500)),
    ('instagram_url', sa.String(length=500)),
    ('tiktok_url', sa.String(length=500)),
    ('facebook_url', sa.String(length=500)),
    ('twitter_url', sa.String(length=500)),
    ('linkedin_url', sa.String(length=500)),
    ('website_url', sa.String(length=500)),
]


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing = {col['name'] for col in inspector.get_columns('users')}
    for name, column_type in PROFILE_COLUMNS:
        if name not in existing:
            op.add_column('users', sa.Column(name, column_type, nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing = {col['name'] for col in inspector.get_columns('users')}
    for name, _ in reversed(PROFILE_COLUMNS):
        if name in existing:
            op.drop_column('users', name)
