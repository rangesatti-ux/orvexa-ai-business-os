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
    text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

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
        default=lambda: datetime.now().date(),
    )

    check_in = Column(
        Time,
        nullable=True,
    )

    check_out = Column(
        Time,
        nullable=True,
    )

    working_hours = Column(
        Float,
        default=0.0,
        server_default="0.0",
        nullable=False,
    )

    status = Column(
        String(20),
        default="Present",
        server_default=text("'Present'"),
        nullable=False,
    )

    remarks = Column(
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

    employee = relationship(
        "Employee",
        back_populates="attendance_records",
    )

    @property
    def calculated_working_hours(self) -> float:
        """Dynamically calculates total hours if check_in and check_out are present."""
        if self.working_hours and self.working_hours > 0:
            return round(self.working_hours, 2)
        if self.check_in and self.check_out:
            today = datetime.today()
            dt_in = datetime.combine(today, self.check_in)
            dt_out = datetime.combine(today, self.check_out)
            if dt_out > dt_in:
                diff = (dt_out - dt_in).total_seconds() / 3600.0
                return round(diff, 2)
        return 0.0