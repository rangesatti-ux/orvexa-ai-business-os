from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class PurchaseItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)
    price: float = Field(gt=0)


class PurchaseCreate(BaseModel):
    supplier_id: int = Field(gt=0)
    gst: float = Field(default=0.0, ge=0)
    discount: float = Field(default=0.0, ge=0)
    items: list[PurchaseItemCreate]


class PurchaseItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    total: float

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


class PurchaseListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    purchases: list[PurchaseResponse]