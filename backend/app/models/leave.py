
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

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    employee = relationship(
        "Employee",
        back_populates="leave_records",
    )
