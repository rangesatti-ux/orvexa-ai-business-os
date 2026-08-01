from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from app.database.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    product_code = Column(String(50), unique=True, nullable=False)

    product_name = Column(String(100), nullable=False)

    category = Column(String(50))

    quantity = Column(Integer, default=0)

    price = Column(Float, default=0)

    supplier = Column(String(100))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sale_items = relationship("SaleItem", back_populates="product")

    purchase_items = relationship(
    "PurchaseItem",
    back_populates="product"
)