"""add revenue and sponsorship tables

Revision ID: 00c5cef74fec
Revises: 8c1f6f4a2b7e
Create Date: 2026-08-21 16:50:58.651919
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '00c5cef74fec'
down_revision: Union[str, Sequence[str], None] = '8c1f6f4a2b7e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create revenue table if not exists
    op.create_table(
        'revenue',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('source', sa.String(length=100), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('currency', sa.String(length=10), nullable=False, server_default='INR'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('revenue_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index(op.f('ix_revenue_id'), 'revenue', ['id'], unique=False, if_not_exists=True)
    op.create_index(op.f('ix_revenue_creator_id'), 'revenue', ['creator_id'], unique=False, if_not_exists=True)

    # Create sponsorship table if not exists
    op.create_table(
        'sponsorship',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('brand_name', sa.String(length=150), nullable=False),
        sa.Column('campaign_name', sa.String(length=150), nullable=False),
        sa.Column('contract_value', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('currency', sa.String(length=10), nullable=False, server_default='INR'),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='Draft'),
        sa.Column('payment_status', sa.String(length=50), nullable=False, server_default='Pending'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index(op.f('ix_sponsorship_id'), 'sponsorship', ['id'], unique=False, if_not_exists=True)
    op.create_index(op.f('ix_sponsorship_creator_id'), 'sponsorship', ['creator_id'], unique=False, if_not_exists=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_sponsorship_creator_id'), table_name='sponsorship')
    op.drop_index(op.f('ix_sponsorship_id'), table_name='sponsorship')
    op.drop_table('sponsorship')

    op.drop_index(op.f('ix_revenue_creator_id'), table_name='revenue')
    op.drop_index(op.f('ix_revenue_id'), table_name='revenue')
    op.drop_table('revenue')
