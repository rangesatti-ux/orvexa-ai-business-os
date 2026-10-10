"""add tasks table

Revision ID: 33005353682c
Revises: 0915de9f9cd7
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "33005353682c"
down_revision: Union[str, Sequence[str], None] = "0915de9f9cd7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the tasks table without modifying departments."""
    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "employee",
            sa.String(length=150),
            server_default="Unassigned",
            nullable=False,
        ),
        sa.Column(
            "priority",
            sa.String(length=20),
            server_default="Medium",
            nullable=False,
        ),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column(
            "status",
            sa.String(length=30),
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

    op.create_index("ix_tasks_id", "tasks", ["id"], unique=False)
    op.create_index("ix_tasks_title", "tasks", ["title"], unique=False)


def downgrade() -> None:
    """Remove the tasks table only."""
    op.drop_index("ix_tasks_title", table_name="tasks")
    op.drop_index("ix_tasks_id", table_name="tasks")
    op.drop_table("tasks")