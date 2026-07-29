from pydantic import BaseModel
from datetime import datetime


# -----------------------------
# Sale Item Schemas
# -----------------------------

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    total: float

    class Config:
        from_attributes = True


# -----------------------------
# Sale Schemas
# -----------------------------

class SaleCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: str
    payment_method: str
    discount: float = 0
    gst: float = 18
    items: list[SaleItemCreate]


class SaleResponse(BaseModel):
    id: int
    invoice_number: str

    customer_name: str
    customer_phone: str
    customer_email: str

    subtotal: float
    gst: float
    discount: float
    grand_total: float

    payment_method: str
    payment_status: str

    created_at: datetime

    items: list[SaleItemResponse]

    class Config:
        from_attributes = True


# -----------------------------
# List Response
# -----------------------------

class SaleListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    sales: list[SaleResponse]