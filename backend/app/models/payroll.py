
from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    ForeignKey,
    DateTime,
    text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Payroll(Base):
    __tablename__ = "payrolls"

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
    )

    basic_salary = Column(
        Float,
        nullable=False,
    )

    hra = Column(
        Float,
        default=0,
        server_default=text("0"),
        nullable=False,
    )

    allowance = Column(
        Float,
        default=0,
        server_default=text("0"),
        nullable=False,
    )

    bonus = Column(
        Float,
        default=0,
        server_default=text("0"),
        nullable=False,
    )

    deduction = Column(
        Float,
        default=0,
        server_default=text("0"),
        nullable=False,
    )

    net_salary = Column(
        Float,
        default=0,
        server_default=text("0"),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    employee = relationship(
        "Employee",
        back_populates="payrolls",
    )
