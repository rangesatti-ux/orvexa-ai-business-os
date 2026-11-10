from sqlalchemy import (
    Column,
    Integer,
    Float,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship

from app.database.base import Base


class SaleItem(Base):
    __tablename__ = "sale_items"

    __table_args__ = (
        Index("ix_sale_items_sale_id", "sale_id"),
        Index("ix_sale_items_product_id", "product_id"),
    )

    id = Column(
        Integer, 
        primary_key=True, 
        index=True
    )

    sale_id = Column(
        Integer,
        ForeignKey("sales.id", ondelete="CASCADE"),
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
    )

    price = Column(
        Float, 
        nullable=False,
        default=0.0,
        doc="Unit selling price at time of sale",
    )

    total = Column(
        Float, 
        nullable=False,
        default=0.0,
    )

    # Relationships
    sale = relationship(
        "Sale",
        back_populates="items",
    )

    product = relationship(
        "Product",
        back_populates="sale_items",
    )

    @property
    def calculated_total(self) -> float:
        """Calculates line item total dynamically: quantity * price."""
        return round((self.quantity or 0) * (self.price or 0.0), 2)