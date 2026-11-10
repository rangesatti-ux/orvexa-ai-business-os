from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Product(Base):
    __tablename__ = "products"

    __table_args__ = (
        Index("ix_products_product_code", "product_code"),
        Index("ix_products_product_name", "product_name"),
        Index("ix_products_category", "category"),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    product_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    product_name = Column(
        String(100),
        nullable=False,
        index=True,
    )

    category = Column(
        String(50),
        nullable=True,
        index=True,
    )

    quantity = Column(
        Integer,
        default=0,
        server_default="0",
        nullable=False,
    )

    min_stock_level = Column(
        Integer,
        default=10,
        server_default="10",
        nullable=False,
        doc="Threshold for low-stock warnings and reorder alerts",
    )

    price = Column(
        Float,
        default=0.0,
        server_default="0.0",
        nullable=False,
        doc="Selling price per unit",
    )

    cost_price = Column(
        Float,
        default=0.0,
        server_default="0.0",
        nullable=False,
        doc="Cost price per unit for margin calculation",
    )

    # Legacy string supplier column for compatibility
    supplier = Column(
        String(100),
        nullable=True,
    )

    # Foreign key link to Supplier model
    supplier_id = Column(
        Integer,
        ForeignKey("suppliers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
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
    supplier_rel = relationship(
        "Supplier",
        foreign_keys=[supplier_id],
    )

    sale_items = relationship(
        "SaleItem",
        back_populates="product",
        cascade="all, delete-orphan",
    )

    purchase_items = relationship(
        "PurchaseItem",
        back_populates="product",
        cascade="all, delete-orphan",
    )

    # --- Property Aliases & Low Stock Helper ---
    @property
    def name(self) -> str:
        """Alias property so both .name and .product_name resolve cleanly."""
        return self.product_name

    @name.setter
    def name(self, value: str):
        self.product_name = value

    @property
    def is_low_stock(self) -> bool:
        """Flag indicating whether quantity is at or below minimum threshold."""
        return (self.quantity or 0) <= (self.min_stock_level or 0)