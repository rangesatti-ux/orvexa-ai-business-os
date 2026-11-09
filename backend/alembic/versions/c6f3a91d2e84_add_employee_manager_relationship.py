"""add employee manager relationship

Revision ID: c6f3a91d2e84
Revises: b8c2e7a41d90
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c6f3a91d2e84"
down_revision: Union[str, Sequence[str], None] = "b8c2e7a41d90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "employees",
        sa.Column("manager_id", sa.Integer(), nullable=True),
    )

    op.create_check_constraint(
        "ck_employee_not_own_manager",
        "employees",
        "manager_id IS NULL OR manager_id != id",
    )

    op.create_foreign_key(
        "fk_employees_manager_id_employees",
        "employees",
        "employees",
        ["manager_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_index(
        "ix_employees_manager_id",
        "employees",
        ["manager_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_employees_manager_id",
        table_name="employees",
    )

    op.drop_constraint(
        "fk_employees_manager_id_employees",
        "employees",
        type_="foreignkey",
    )

    op.drop_constraint(
        "ck_employee_not_own_manager",
        "employees",
        type_="check",
    )

    op.drop_column("employees", "manager_id")
