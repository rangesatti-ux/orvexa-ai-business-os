
from sqlalchemy import (
    Column,
    Integer,
    Date,
    DateTime,
    Time,
    String,
    ForeignKey,
    Float,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Attendance(Base):
    __tablename__ = "attendance"

    __table_args__ = (
        UniqueConstraint(
            "employee_id",
            "attendance_date",
            name="uq_attendance_employee_date",
        ),
        Index(
            "ix_attendance_employee_date",
            "employee_id",
            "attendance_date",
        ),
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

    attendance_date = Column(
        Date,
        nullable=False,
    )

    check_in = Column(Time)

    check_out = Column(Time)

    working_hours = Column(
        Float,
        default=0,
        nullable=False,
    )

    status = Column(
        String(20),
        default="Present",
        nullable=False,
    )

    remarks = Column(
        String(255),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    employee = relationship(
        "Employee",
        back_populates="attendance_records",
    )
