from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Index,
    text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Purchase(Base):
    __tablename__ = "purchases"

    __table_args__ = (
        Index("ix_purchases_purchase_number", "purchase_number"),
        Index("ix_purchases_supplier_id", "supplier_id"),
        Index("ix_purchases_invoice_date", "invoice_date"),
        Index("ix_purchases_status", "status"),
    )

    id = Column(
        Integer, 
        primary_key=True, 
        index=True
    )

    purchase_number = Column(
        String(30), 
        unique=True, 
        nullable=False,
        index=True,
    )

    supplier_id = Column(
        Integer,
        ForeignKey("suppliers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
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

    status = Column(
        String(30),
        default="Received",
        server_default=text("'Received'"),
        nullable=False,
        doc="Order Status: Received, Pending, Cancelled",
    )

    payment_status = Column(
        String(30),
        default="Paid",
        server_default=text("'Paid'"),
        nullable=False,
        doc="Payment Status: Paid, Pending, Partial",
    )

    payment_method = Column(
        String(50),
        default="Bank Transfer",
        nullable=True,
    )

    invoice_date = Column(
        DateTime(timezone=True),
        server_default=func.now(),
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
    supplier = relationship(
        "Supplier",
        back_populates="purchases",
    )

    items = relationship(
        "PurchaseItem",
        back_populates="purchase",
        cascade="all, delete-orphan",
    )

    @property
    def calculated_grand_total(self) -> float:
        """Calculates grand total on-the-fly from subtotal, GST, and discount."""
        calc_sub = sum(item.calculated_total for item in self.items) if self.items else (self.subtotal or 0.0)
        total = calc_sub + (self.gst or 0.0) - (self.discount or 0.0)
        return round(max(total, 0.0), 2)


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    __table_args__ = (
        Index("ix_purchase_items_purchase_id", "purchase_id"),
        Index("ix_purchase_items_product_id", "product_id"),
    )

    id = Column(
        Integer, 
        primary_key=True, 
        index=True
    )

    purchase_id = Column(
        Integer,
        ForeignKey("purchases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    quantity = Column(
        Integer, 
        nullable=False,
        default=1,
        server_default="1",
    )

    price = Column(
        Float, 
        nullable=False,
        default=0.0,
        server_default="0.0",
        doc="Unit cost price at time of purchase",
    )

    total = Column(
        Float, 
        nullable=False,
        default=0.0,
        server_default="0.0",
    )

    # Relationships
    purchase = relationship(
        "Purchase",
        back_populates="items",
    )

    product = relationship(
        "Product",
        back_populates="purchase_items",
    )

    @property
    def calculated_total(self) -> float:
        """Calculates item line total: quantity * price."""
        return round((self.quantity or 0) * (self.price or 0.0), 2)