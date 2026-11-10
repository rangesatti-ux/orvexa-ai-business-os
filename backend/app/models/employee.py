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
        Index("ix_employees_email", "email"),
        Index("ix_employees_employee_id", "employee_id"),
        Index("ix_employees_full_name", "full_name"),
        Index("ix_employees_status", "status"),
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

    phone = Column(
        String(50),
        nullable=True,
    )

    # Retained string column for backwards compatibility.
    department = Column(
        String(100),
        nullable=True,
    )

    position = Column(
        String(100),
        nullable=True,
    )

    salary = Column(
        Float,
        default=0.0,
        server_default="0.0",
        nullable=False,
    )

    joining_date = Column(
        Date,
        nullable=True,
    )

    status = Column(
        String(50),
        default="Active",
        server_default=text("'Active'"),
        nullable=False,
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

    # Login account relationship.
    user = relationship(
        "User",
        back_populates="employee",
        uselist=False,
    )

    # Department relationship matching Department.employees
    department_rel = relationship(
        "Department",
        back_populates="employees",
        foreign_keys=[department_id],
    )

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

    # --- Property Aliases for Full Compatibility ---
    @property
    def name(self) -> str:
        """Alias property so both .name and .full_name resolve cleanly."""
        return self.full_name

    @name.setter
    def name(self, value: str):
        self.full_name = value

    @property
    def first_name(self) -> str:
        """Derives first name from full_name."""
        parts = (self.full_name or "").strip().split(" ")
        return parts[0] if parts else ""

    @property
    def last_name(self) -> str:
        """Derives last name from full_name."""
        parts = (self.full_name or "").strip().split(" ")
        return " ".join(parts[1:]) if len(parts) > 1 else ""

    @property
    def designation(self) -> str:
        """Alias property so both .designation and .position resolve cleanly."""
        return self.position or ""

    @designation.setter
    def designation(self, value: str):
        self.position = value

    @property
    def role(self) -> str:
        """Derives user role from linked User account or defaults to Employee."""
        if self.user and hasattr(self.user, "role"):
            return self.user.role
        return "Employee"