from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func

from app.database.base import Base
from sqlalchemy.orm import relationship


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)

    supplier_code = Column(String(20), unique=True, nullable=False)

    supplier_name = Column(String(150), nullable=False)

    contact_person = Column(String(100))

    phone = Column(String(20), unique=True, nullable=False)

    email = Column(String(100), unique=True)

    address = Column(String(255))

    city = Column(String(100))

    state = Column(String(100))

    pincode = Column(String(10))

    gst_number = Column(String(20), unique=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    purchases = relationship(
    "Purchase",
    back_populates="supplier"
)