from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)

    invoice_number = Column(String(30), unique=True, nullable=False)

    customer_name = Column(String(100), nullable=False)

    customer_phone = Column(String(20))

    customer_email = Column(String(100))

    subtotal = Column(Float, default=0)

    gst = Column(Float, default=0)

    discount = Column(Float, default=0)

    grand_total = Column(Float, default=0)

    payment_method = Column(String(30))

    payment_status = Column(String(20), default="Paid")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    items = relationship(
        "SaleItem",
        back_populates="sale",
        cascade="all, delete-orphan"
    )