
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    CheckConstraint,
    Index,
    text,
)
from sqlalchemy.sql import func

from app.database.base import Base


class Department(Base):
    __tablename__ = "departments"

    __table_args__ = (
        CheckConstraint(
            "status IN ('Active', 'Inactive')",
            name="ck_department_status",
        ),
        Index("ix_departments_status", "status"),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    department_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    department_name = Column(
        String(150),
        nullable=False,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    manager_name = Column(
        String(150),
        nullable=True,
    )

    status = Column(
        String(50),
        nullable=False,
        default="Active",
        server_default=text("'Active'"),
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
