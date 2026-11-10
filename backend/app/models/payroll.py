from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    ForeignKey,
    DateTime,
    Date,
    UniqueConstraint,
    Index,
    text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Payroll(Base):
    __tablename__ = "payrolls"

    __table_args__ = (
        UniqueConstraint(
            "employee_id",
            "month",
            name="uq_payroll_employee_month",
        ),
        Index("ix_payrolls_employee_month", "employee_id", "month"),
        Index("ix_payrolls_status", "status"),
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
        index=True,
    )

    month = Column(
        String(20),
        nullable=False,
        doc="Target payroll month in YYYY-MM or Month Year format (e.g. 2026-11 or November 2026)",
    )

    basic_salary = Column(
        Float,
        default=0.0,
        server_default=text("0"),
        nullable=False,
    )

    hra = Column(
        Float,
        default=0.0,
        server_default=text("0"),
        nullable=False,
    )

    allowance = Column(
        Float,
        default=0.0,
        server_default=text("0"),
        nullable=False,
    )

    bonus = Column(
        Float,
        default=0.0,
        server_default=text("0"),
        nullable=False,
    )

    deduction = Column(
        Float,
        default=0.0,
        server_default=text("0"),
        nullable=False,
    )

    net_salary = Column(
        Float,
        default=0.0,
        server_default=text("0"),
        nullable=False,
    )

    status = Column(
        String(20),
        default="Pending",
        server_default=text("'Pending'"),
        nullable=False,
        doc="Status options: Pending, Processing, Paid",
    )

    payment_date = Column(
        Date,
        nullable=True,
    )

    payment_method = Column(
        String(50),
        default="Bank Transfer",
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
        back_populates="payrolls",
    )

    # --- Property Aliases & Helpers ---
    @property
    def allowances(self) -> float:
        """Alias property for allowance."""
        return self.allowance or 0.0

    @allowances.setter
    def allowances(self, value: float):
        self.allowance = value or 0.0

    @property
    def deductions(self) -> float:
        """Alias property for deduction."""
        return self.deduction or 0.0

    @deductions.setter
    def deductions(self, value: float):
        self.deduction = value or 0.0

    @property
    def total_earnings(self) -> float:
        """Calculates total gross earnings prior to deductions."""
        return round(
            (self.basic_salary or 0.0)
            + (self.hra or 0.0)
            + (self.allowance or 0.0)
            + (self.bonus or 0.0),
            2,
        )

    @property
    def calculated_net_salary(self) -> float:
        """Calculates net salary dynamically: gross earnings minus deductions."""
        calc = self.total_earnings - (self.deduction or 0.0)
        return round(max(calc, 0.0), 2)