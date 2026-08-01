from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    ForeignKey,
    DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class Payroll(Base):
    __tablename__ = "payrolls"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    month = Column(String(20), nullable=False)

    basic_salary = Column(Float, nullable=False)

    hra = Column(Float, default=0)

    allowance = Column(Float, default=0)

    bonus = Column(Float, default=0)

    deduction = Column(Float, default=0)

    net_salary = Column(Float, default=0)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    employee = relationship(
        "Employee",
        back_populates="payrolls"
    )