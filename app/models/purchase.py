from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)

    purchase_number = Column(String(30), unique=True, nullable=False)

    supplier_id = Column(
        Integer,
        ForeignKey("suppliers.id"),
        nullable=False
    )

    subtotal = Column(Float, default=0)

    gst = Column(Float, default=0)

    discount = Column(Float, default=0)

    grand_total = Column(Float, default=0)

    invoice_date = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    supplier = relationship(
    "Supplier",
    back_populates="purchases"
)

    items = relationship(
        "PurchaseItem",
        back_populates="purchase",
        cascade="all, delete-orphan"
    )


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True, index=True)

    purchase_id = Column(
        Integer,
        ForeignKey("purchases.id")
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id")
    )

    quantity = Column(Integer, nullable=False)

    price = Column(Float, nullable=False)

    total = Column(Float, nullable=False)

    purchase = relationship(
        "Purchase",
        back_populates="items"
    )

    product = relationship(
        "Product",
        back_populates="purchase_items"
    )