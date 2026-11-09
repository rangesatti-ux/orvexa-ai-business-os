
"""restore workforce tables and link employees to departments

Revision ID: b8c2e7a41d90
Revises: a4375b2d413f
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b8c2e7a41d90"
down_revision: Union[str, Sequence[str], None] = "a4375b2d413f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Restore departments table.
    op.create_table(
        "departments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("department_code", sa.String(50), nullable=False),
        sa.Column("department_name", sa.String(150), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("manager_name", sa.String(150), nullable=True),
        sa.Column(
            "status",
            sa.String(50),
            server_default="Active",
            nullable=False,
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
        sa.CheckConstraint(
            "status IN ('Active', 'Inactive')",
            name="ck_department_status",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_departments_id",
        "departments",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_departments_department_code",
        "departments",
        ["department_code"],
        unique=True,
    )

    op.create_index(
        "ix_departments_department_name",
        "departments",
        ["department_name"],
        unique=False,
    )

    op.create_index(
        "ix_departments_status",
        "departments",
        ["status"],
        unique=False,
    )

    # Restore tasks table.
    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "employee",
            sa.String(150),
            server_default="Unassigned",
            nullable=False,
        ),
        sa.Column(
            "priority",
            sa.String(20),
            server_default="Medium",
            nullable=False,
        ),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column(
            "status",
            sa.String(30),
            server_default="Pending",
            nullable=False,
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
        "ix_tasks_id",
        "tasks",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_tasks_title",
        "tasks",
        ["title"],
        unique=False,
    )

    # Add department relationship to existing employees.
    op.add_column(
        "employees",
        sa.Column("department_id", sa.Integer(), nullable=True),
    )

    op.create_index(
        "ix_employees_department_id",
        "employees",
        ["department_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_employees_department_id_departments",
        "employees",
        "departments",
        ["department_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_employees_department_id_departments",
        "employees",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_employees_department_id",
        table_name="employees",
    )

    op.drop_column("employees", "department_id")

    op.drop_index("ix_tasks_title", table_name="tasks")
    op.drop_index("ix_tasks_id", table_name="tasks")
    op.drop_table("tasks")

    op.drop_index(
        "ix_departments_status",
        table_name="departments",
    )
    op.drop_index(
        "ix_departments_department_name",
        table_name="departments",
    )
    op.drop_index(
        "ix_departments_department_code",
        table_name="departments",
    )
    op.drop_index(
        "ix_departments_id",
        table_name="departments",
    )
    op.drop_table("departments")
