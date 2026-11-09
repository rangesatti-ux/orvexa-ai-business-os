
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    text,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    full_name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    password = Column(
        String(255),
        nullable=False,
    )

    role = Column(
        String(20),
        default="Employee",
        server_default=text("'Employee'"),
        nullable=False,
    )

    is_active = Column(
        Boolean,
        default=True,
        server_default=text("true"),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    employee = relationship(
        "Employee",
        back_populates="user",
        uselist=False,
    )
