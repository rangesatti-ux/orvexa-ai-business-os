from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Customer(Base):
    __tablename__ = "customers"

    __table_args__ = (
        Index("ix_customers_customer_code", "customer_code"),
        Index("ix_customers_phone", "phone"),
        Index("ix_customers_email", "email"),
    )

    id = Column(
        Integer, 
        primary_key=True, 
        index=True
    )

    customer_code = Column(
        String(20), 
        unique=True, 
        nullable=False,
        index=True,
    )

    full_name = Column(
        String(100), 
        nullable=False,
        index=True,
    )

    phone = Column(
        String(20), 
        unique=True, 
        nullable=False,
        index=True,
    )

    email = Column(
        String(100), 
        unique=True, 
        nullable=True,
        index=True,
    )

    address = Column(
        String(255), 
        nullable=True
    )

    city = Column(
        String(100), 
        nullable=True
    )

    state = Column(
        String(100), 
        nullable=True
    )

    pincode = Column(
        String(10), 
        nullable=True
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
    sales = relationship(
        "Sale",
        back_populates="customer",
        cascade="all, delete-orphan",
    )

    @property
    def name(self) -> str:
        """Alias property so both .name and .full_name resolve cleanly."""
        return self.full_name

    @name.setter
    def name(self, value: str):
        self.full_name = value