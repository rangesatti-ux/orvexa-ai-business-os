from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Index,
    text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Sale(Base):
    __tablename__ = "sales"

    __table_args__ = (
        Index("ix_sales_invoice_number", "invoice_number"),
        Index("ix_sales_customer_id", "customer_id"),
        Index("ix_sales_payment_status", "payment_status"),
        Index("ix_sales_created_at", "created_at"),
    )

    id = Column(
        Integer, 
        primary_key=True, 
        index=True
    )

    invoice_number = Column(
        String(30), 
        unique=True, 
        nullable=False,
        index=True,
    )

    customer_id = Column(
        Integer,
        ForeignKey("customers.id", ondelete="SETNULL"),
        nullable=True,
        index=True,
    )

    customer_name = Column(
        String(100), 
        nullable=False,
        default="Walk-in",
        server_default=text("'Walk-in'"),
    )

    customer_phone = Column(
        String(20),
        nullable=True,
    )

    customer_email = Column(
        String(100),
        nullable=True,
    )

    subtotal = Column(
        Float, 
        default=0.0,
        server_default="0.0",
        nullable=False,
    )

    gst = Column(
        Float, 
        default=0.0,
        server_default="0.0",
        nullable=False,
    )

    discount = Column(
        Float, 
        default=0.0,
        server_default="0.0",
        nullable=False,
    )

    grand_total = Column(
        Float, 
        default=0.0,
        server_default="0.0",
        nullable=False,
    )

    payment_method = Column(
        String(30),
        default="Cash",
        nullable=True,
    )

    payment_status = Column(
        String(20), 
        default="Paid",
        server_default=text("'Paid'"),
        nullable=False,
        doc="Payment options: Paid, Pending, Refunded, Partial",
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
    customer = relationship(
        "Customer",
        back_populates="sales",
        foreign_keys=[customer_id],
    )

    items = relationship(
        "SaleItem",
        back_populates="sale",
        cascade="all, delete-orphan",
    )

    @property
    def calculated_grand_total(self) -> float:
        """Calculates grand total on-the-fly: subtotal + GST - discount."""
        calc_sub = sum(item.calculated_total for item in self.items) if self.items else (self.subtotal or 0.0)
        total = calc_sub + (self.gst or 0.0) - (self.discount or 0.0)
        return round(max(total, 0.0), 2)