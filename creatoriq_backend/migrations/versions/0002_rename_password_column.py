"""Sync users schema and create content table.

Revision ID: 0002_rename_password_column
Revises: 0001_initial_users
Create Date: 2026-08-08

The live database was stamped at 0001 with a reduced users table
(id, full_name, email, password, role) and no content table.
This migration brings the schema in line with the application models.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect


revision: str = '0002_rename_password_column'
down_revision: Union[str, Sequence[str], None] = '0001_initial_users'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(inspector, table: str, column: str) -> bool:
    if table not in inspector.get_table_names():
        return False
    return any(col['name'] == column for col in inspector.get_columns(table))


def _has_table(inspector, table: str) -> bool:
    return table in inspector.get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)

    if _has_column(inspector, 'users', 'password') and not _has_column(inspector, 'users', 'password_hash'):
        op.alter_column('users', 'password', new_column_name='password_hash')
        inspector = inspect(bind)

    if not _has_column(inspector, 'users', 'status'):
        op.add_column(
            'users',
            sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        )

    if not _has_column(inspector, 'users', 'agency_id'):
        op.add_column('users', sa.Column('agency_id', sa.Integer(), nullable=True))
        op.create_foreign_key(
            'fk_users_agency_id_users',
            'users',
            'users',
            ['agency_id'],
            ['id'],
            ondelete='SET NULL',
        )
        op.create_index('ix_users_agency_id', 'users', ['agency_id'], unique=False)

    if not _has_column(inspector, 'users', 'created_at'):
        op.add_column('users', sa.Column('created_at', sa.DateTime(), nullable=True))
        op.execute(sa.text("UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"))
        op.alter_column('users', 'created_at', nullable=False)

    if not _has_column(inspector, 'users', 'updated_at'):
        op.add_column('users', sa.Column('updated_at', sa.DateTime(), nullable=True))
        op.execute(sa.text("UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL"))
        op.alter_column('users', 'updated_at', nullable=False)

    inspector = inspect(bind)
    if not _has_table(inspector, 'content'):
        op.create_table(
            'content',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('creator_id', sa.Integer(), nullable=False),
            sa.Column('platform', sa.String(length=50), nullable=False),
            sa.Column('content_id', sa.String(length=150), nullable=False),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('content_type', sa.String(length=50), nullable=False),
            sa.Column('published_at', sa.Date(), nullable=False),
            sa.Column('views', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('likes', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('comments', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('shares', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('saves', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('watch_time', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('reach', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('engagement_rate', sa.Float(), nullable=False, server_default='0'),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index('ix_content_id', 'content', ['id'], unique=False)
        op.create_index('ix_content_creator_id', 'content', ['creator_id'], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)

    if _has_table(inspector, 'content'):
        op.drop_index('ix_content_creator_id', table_name='content')
        op.drop_index('ix_content_id', table_name='content')
        op.drop_table('content')

    inspector = inspect(bind)
    if _has_column(inspector, 'users', 'updated_at'):
        op.drop_column('users', 'updated_at')
    if _has_column(inspector, 'users', 'created_at'):
        op.drop_column('users', 'created_at')
    if _has_column(inspector, 'users', 'agency_id'):
        op.drop_constraint('fk_users_agency_id_users', 'users', type_='foreignkey')
        op.drop_index('ix_users_agency_id', table_name='users')
        op.drop_column('users', 'agency_id')
    if _has_column(inspector, 'users', 'status'):
        op.drop_column('users', 'status')
    if _has_column(inspector, 'users', 'password_hash') and not _has_column(inspector, 'users', 'password'):
        op.alter_column('users', 'password_hash', new_column_name='password')
