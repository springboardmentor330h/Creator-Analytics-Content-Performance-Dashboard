"""create_revenue_and_sponsorship_tables

Revision ID: 95b43d6077c7
Revises: 
Create Date: 2026-08-21 15:15:19.013896

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '95b43d6077c7'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create revenues table if it doesn't exist
    op.create_table(
        'revenues',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(), nullable=False, server_default='USD'),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_revenues_id'), 'revenues', ['id'], unique=False)
    op.create_index(op.f('ix_revenues_creator_id'), 'revenues', ['creator_id'], unique=False)
    op.create_index(op.f('ix_revenues_source'), 'revenues', ['source'], unique=False)
    op.create_index(op.f('ix_revenues_date'), 'revenues', ['date'], unique=False)

    # Create sponsorships table if it doesn't exist
    op.create_table(
        'sponsorships',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('brand_name', sa.String(), nullable=False),
        sa.Column('campaign_name', sa.String(), nullable=False),
        sa.Column('contract_value', sa.Float(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='Active'),
        sa.Column('payment_status', sa.String(), nullable=False, server_default='Unpaid'),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sponsorships_id'), 'sponsorships', ['id'], unique=False)
    op.create_index(op.f('ix_sponsorships_creator_id'), 'sponsorships', ['creator_id'], unique=False)
    op.create_index(op.f('ix_sponsorships_brand_name'), 'sponsorships', ['brand_name'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_sponsorships_brand_name'), table_name='sponsorships')
    op.drop_index(op.f('ix_sponsorships_creator_id'), table_name='sponsorships')
    op.drop_index(op.f('ix_sponsorships_id'), table_name='sponsorships')
    op.drop_table('sponsorships')

    op.drop_index(op.f('ix_revenues_date'), table_name='revenues')
    op.drop_index(op.f('ix_revenues_source'), table_name='revenues')
    op.drop_index(op.f('ix_revenues_creator_id'), table_name='revenues')
    op.drop_index(op.f('ix_revenues_id'), table_name='revenues')
    op.drop_table('revenues')
