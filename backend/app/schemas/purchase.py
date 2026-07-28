from datetime import datetime
from pydantic import BaseModel, Field


class PurchaseItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    price: float = Field(gt=0)


class PurchaseCreate(BaseModel):
    supplier_id: int
    gst: float = 0
    discount: float = 0
    items: list[PurchaseItemCreate]


class PurchaseItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    total: float

    class Config:
        from_attributes = True


class PurchaseResponse(BaseModel):
    id: int
    purchase_number: str
    supplier_id: int
    subtotal: float
    gst: float
    discount: float
    grand_total: float
    invoice_date: datetime
    created_at: datetime
    items: list[PurchaseItemResponse]

    class Config:
        from_attributes = True


class PurchaseListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    purchases: list[PurchaseResponse]