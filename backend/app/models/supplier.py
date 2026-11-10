from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Index,
    text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    __table_args__ = (
        Index("ix_suppliers_supplier_code", "supplier_code"),
        Index("ix_suppliers_supplier_name", "supplier_name"),
        Index("ix_suppliers_phone", "phone"),
        Index("ix_suppliers_email", "email"),
        Index("ix_suppliers_gst_number", "gst_number"),
    )

    id = Column(
        Integer, 
        primary_key=True, 
        index=True
    )

    supplier_code = Column(
        String(20), 
        unique=True, 
        nullable=False,
        index=True,
    )

    supplier_name = Column(
        String(150), 
        nullable=False,
        index=True,
    )

    contact_person = Column(
        String(100),
        nullable=True,
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
        nullable=True,
    )

    city = Column(
        String(100),
        nullable=True,
    )

    state = Column(
        String(100),
        nullable=True,
    )

    pincode = Column(
        String(10),
        nullable=True,
    )

    gst_number = Column(
        String(20), 
        unique=True,
        nullable=True,
        index=True,
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

    # Relationships
    purchases = relationship(
        "Purchase",
        back_populates="supplier",
        cascade="all, delete-orphan",
    )

    # --- Property Aliases ---
    @property
    def name(self) -> str:
        """Alias property so both .name and .supplier_name resolve cleanly."""
        return self.supplier_name

    @name.setter
    def name(self, value: str):
        self.supplier_name = value