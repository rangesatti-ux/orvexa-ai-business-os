
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
    text,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class Employee(Base):
    __tablename__ = "employees"

    __table_args__ = (
        CheckConstraint(
            "manager_id IS NULL OR manager_id != id",
            name="ck_employee_not_own_manager",
        ),
        Index("ix_employees_manager_id", "manager_id"),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Link employee profile to login account.
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        unique=True,
        nullable=True,
        index=True,
    )

    # Link employee to a department.
    department_id = Column(
        Integer,
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Assign one direct manager to each employee.
    # Manager can be changed by Admin/HR in the future.
    manager_id = Column(
        Integer,
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
    )

    employee_id = Column(
        String(50),
        unique=True,
        nullable=False,
    )

    full_name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(100),
        unique=True,
        nullable=False,
    )

    phone = Column(String)

    # Retained for compatibility with existing records.
    department = Column(String)

    position = Column(String)
    salary = Column(Float)
    joining_date = Column(Date)

    status = Column(
        String,
        default="Active",
        server_default=text("'Active'"),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Login account relationship.
    user = relationship(
        "User",
        back_populates="employee",
        uselist=False,
    )

    # Department relationship.
    department_record = relationship("Department")

    # Self-referencing manager relationship.
    manager = relationship(
        "Employee",
        remote_side="Employee.id",
        foreign_keys=[manager_id],
        back_populates="direct_reports",
    )

    # Employees reporting directly to this manager.
    direct_reports = relationship(
        "Employee",
        foreign_keys=[manager_id],
        back_populates="manager",
    )

    # Attendance relationship.
    attendance_records = relationship(
        "Attendance",
        back_populates="employee",
        cascade="all, delete-orphan",
    )

    # Leave relationship.
    leave_records = relationship(
        "Leave",
        back_populates="employee",
        cascade="all, delete-orphan",
    )

    # Payroll relationship.
    payrolls = relationship(
        "Payroll",
        back_populates="employee",
        cascade="all, delete-orphan",
    )
