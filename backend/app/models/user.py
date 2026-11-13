from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    Index,
    text,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        Index("ix_users_email", "email"),
        Index("ix_users_role", "role"),
        Index("ix_users_is_active", "is_active"),
    )

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

    hashed_password = Column(
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
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Reverse relationship to Employee profile
    employee = relationship(
        "Employee",
        back_populates="user",
        uselist=False,
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
    def password(self) -> str:
        """Alias property for backward compatibility."""
        return self.hashed_password

    @password.setter
    def password(self, value: str):
        self.hashed_password = value