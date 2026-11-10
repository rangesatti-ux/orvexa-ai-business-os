from sqlalchemy import (
    Column,
    Integer,
    String,
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


class Leave(Base):
    __tablename__ = "leaves"

    __table_args__ = (
        CheckConstraint(
            "end_date >= start_date",
            name="ck_leave_end_date_after_start_date",
        ),
        Index("ix_leaves_employee_id", "employee_id"),
        Index("ix_leaves_status", "status"),
        Index("ix_leaves_start_date", "start_date"),
        Index("ix_leaves_approved_by_id", "approved_by_id"),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    employee_id = Column(
        Integer,
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
    )

    leave_type = Column(
        String(50),
        nullable=False,
    )

    start_date = Column(
        Date,
        nullable=False,
    )

    end_date = Column(
        Date,
        nullable=False,
    )

    reason = Column(
        String(500),
        nullable=True,
    )

    status = Column(
        String(20),
        default="Pending",
        server_default=text("'Pending'"),
        nullable=False,
    )

    approved_by_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    rejection_reason = Column(
        String(255),
        nullable=True,
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
    employee = relationship(
        "Employee",
        back_populates="leave_records",
    )

    approved_by_user = relationship(
        "User",
        foreign_keys=[approved_by_id],
    )

    @property
    def total_days(self) -> int:
        """Calculates total duration of leave in days."""
        if self.start_date and self.end_date:
            delta = (self.end_date - self.start_date).days + 1
            return max(delta, 1)
        return 0