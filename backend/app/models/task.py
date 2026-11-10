from datetime import date
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
    text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Task(Base):
    __tablename__ = "tasks"

    __table_args__ = (
        CheckConstraint(
            "LOWER(priority) IN ('low', 'medium', 'high', 'urgent')",
            name="ck_task_priority",
        ),
        CheckConstraint(
            "LOWER(status) IN ('pending', 'in progress', 'completed', 'cancelled')",
            name="ck_task_status",
        ),
        Index("ix_tasks_status", "status"),
        Index("ix_tasks_priority", "priority"),
        Index("ix_tasks_due_date", "due_date"),
        Index("ix_tasks_assigned_to_id", "assigned_to_id"),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String(200),
        nullable=False,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    # Foreign key relationship linking task directly to an Employee record
    assigned_to_id = Column(
        Integer,
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Optional relationship linking task creator to User
    created_by_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Retained string employee column for backwards compatibility
    employee = Column(
        String(150),
        nullable=False,
        default="Unassigned",
        server_default=text("'Unassigned'"),
    )

    priority = Column(
        String(20),
        nullable=False,
        default="Medium",
        server_default=text("'Medium'"),
    )

    due_date = Column(
        Date,
        nullable=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="Pending",
        server_default=text("'Pending'"),
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    assigned_employee = relationship(
        "Employee",
        foreign_keys=[assigned_to_id],
    )

    created_by_user = relationship(
        "User",
        foreign_keys=[created_by_id],
    )

    # --- Property Helpers ---
    @property
    def is_overdue(self) -> bool:
        """Determines if the task is past its due date and not completed."""
        if self.due_date and self.status.lower() not in ("completed", "cancelled"):
            return self.due_date < date.today()
        return False