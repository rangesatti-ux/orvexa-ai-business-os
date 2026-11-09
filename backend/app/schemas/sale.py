from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# -----------------------------
# Sale Item Schemas
# -----------------------------

class SaleItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    total: float

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# Sale Schemas
# -----------------------------

class SaleCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=150)
    customer_phone: Optional[str] = Field(default=None, max_length=20)
    customer_email: Optional[str] = Field(default=None, max_length=150)
    payment_method: str = Field(default="Cash", max_length=50)
    discount: float = Field(default=0.0, ge=0)
    gst: float = Field(default=18.0, ge=0)
    items: list[SaleItemCreate]


class SaleResponse(BaseModel):
    id: int
    invoice_number: str

    customer_name: str
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None

    subtotal: float
    gst: float
    discount: float
    grand_total: float

    payment_method: str
    payment_status: str

    created_at: datetime

    items: list[SaleItemResponse]

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# List Response
# -----------------------------

class SaleListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    sales: list[SaleResponse]