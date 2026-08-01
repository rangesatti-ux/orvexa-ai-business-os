from sqlalchemy import (
    Column,
    Integer,
    Date,
    DateTime,
    Time,
    String,
    ForeignKey,
    Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    attendance_date = Column(Date, nullable=False)

    check_in = Column(Time)

    check_out = Column(Time)

    working_hours = Column(Float, default=0)

    status = Column(
        String(20),
        default="Present"
    )

    remarks = Column(String(255))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    employee = relationship(
        "Employee",
        back_populates="attendance_records"
    )