"""add departments table

Revision ID: 0915de9f9cd7
Revises: 01c94eeffb5d
Create Date: 2026-09-22 11:56:13.208119

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0915de9f9cd7"
down_revision: Union[str, Sequence[str], None] = "01c94eeffb5d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create departments table."""

    op.create_table(
        "departments",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "department_code",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "department_name",
            sa.String(length=150),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "manager_name",
            sa.String(length=150),
            nullable=True,
        ),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
            server_default="Active",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_departments_id"),
        "departments",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_departments_department_code"),
        "departments",
        ["department_code"],
        unique=True,
    )

    op.create_index(
        op.f("ix_departments_department_name"),
        "departments",
        ["department_name"],
        unique=False,
    )


def downgrade() -> None:
    """Remove departments table."""

    op.drop_index(
        op.f("ix_departments_department_name"),
        table_name="departments",
    )

    op.drop_index(
        op.f("ix_departments_department_code"),
        table_name="departments",
    )

    op.drop_index(
        op.f("ix_departments_id"),
        table_name="departments",
    )

    op.drop_table("departments")