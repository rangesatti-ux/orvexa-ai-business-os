from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(String, unique=True, nullable=False)

    full_name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    phone = Column(String)

    department = Column(String)

    position = Column(String)

    salary = Column(Float)

    joining_date = Column(Date)

    status = Column(String, default="Active")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    attendance_records = relationship(
    "Attendance",
    back_populates="employee",
    cascade="all, delete-orphan"
)

    leave_records = relationship(
    "Leave",
    back_populates="employee",
    cascade="all, delete-orphan"
)

    payrolls = relationship(
    "Payroll",
    back_populates="employee",
    cascade="all, delete-orphan"
)