"""add promo_code_id FK to orders

Revision ID: 3dbefb22beeb
Revises: 3029959f58f5
Create Date: 2026-05-30 13:58:04.073414

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3dbefb22beeb'
down_revision: Union[str, Sequence[str], None] = '3029959f58f5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('orders', sa.Column('promo_code_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_orders_promo_code_id'), 'orders', ['promo_code_id'], unique=False)
    op.create_foreign_key('fk_orders_promo_code_id', 'orders', 'promo_codes', ['promo_code_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_orders_promo_code_id', 'orders', type_='foreignkey')
    op.drop_index(op.f('ix_orders_promo_code_id'), table_name='orders')
    op.drop_column('orders', 'promo_code_id')
