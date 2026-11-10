from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PurchaseItemCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    product_id: int = Field(
        ...,
        gt=0,
        description="ID of the product being purchased.",
    )
    quantity: int = Field(
        ...,
        gt=0,
        description="Quantity of items purchased.",
    )
    price: float = Field(
        ...,
        gt=0,
        description="Purchase unit price.",
    )


class PurchaseCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    supplier_id: int = Field(
        ...,
        gt=0,
        description="ID of the supplier fulfilling the purchase order.",
    )
    gst: float = Field(
        default=0.0,
        ge=0,
        description="GST percentage applied.",
    )
    discount: float = Field(
        default=0.0,
        ge=0,
        description="Discount amount applied.",
    )
    items: list[PurchaseItemCreate] = Field(
        ...,
        description="List of purchase items in the order.",
    )


class PurchaseItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique purchase item ID.")
    product_id: int = Field(..., description="Product ID.")
    quantity: int = Field(..., description="Quantity.")
    price: float = Field(..., description="Unit price.")
    total: float = Field(..., description="Line total amount.")


class PurchaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique purchase order ID.")
    purchase_number: str = Field(..., description="Generated purchase order number (e.g., PO-YYYYMMDD-XXX).")
    supplier_id: int = Field(..., description="Supplier ID.")
    subtotal: float = Field(..., description="Subtotal amount before tax and discount.")
    gst: float = Field(..., description="GST tax amount.")
    discount: float = Field(..., description="Discount amount.")
    grand_total: float = Field(..., description="Final grand total amount.")
    invoice_date: datetime = Field(..., description="Date of the purchase invoice.")
    created_at: datetime = Field(..., description="Record creation timestamp.")
    items: list[PurchaseItemResponse] = Field(..., description="Associated purchase items.")


class PurchaseListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    total: int = Field(..., description="Total matching purchase orders.")
    page: int = Field(..., description="Current page number.")
    limit: int = Field(..., description="Items per page.")
    total_pages: int = Field(..., description="Total available pages.")
    purchases: list[PurchaseResponse] = Field(..., description="List of purchase records.")