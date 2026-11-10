from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# -----------------------------
# Sale Item Schemas
# -----------------------------

class SaleItemCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    product_id: int = Field(
        ...,
        gt=0,
        description="ID of the product being sold.",
    )
    quantity: int = Field(
        ...,
        gt=0,
        description="Quantity of items being purchased.",
    )


class SaleItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique sale item record ID.")
    product_id: int = Field(..., description="Product ID.")
    quantity: int = Field(..., description="Quantity sold.")
    price: float = Field(..., description="Unit price at the time of sale.")
    total: float = Field(..., description="Line total amount.")


# -----------------------------
# Sale Schemas
# -----------------------------

class SaleCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    customer_name: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="Full name of the customer.",
    )
    customer_phone: Optional[str] = Field(
        default=None,
        max_length=20,
        description="Contact phone number of the customer.",
    )
    customer_email: Optional[EmailStr] = Field(
        default=None,
        description="Email address of the customer.",
    )
    payment_method: str = Field(
        default="Cash",
        max_length=50,
        description="Method of payment (e.g., Cash, UPI, Card).",
    )
    discount: float = Field(
        default=0.0,
        ge=0,
        description="Discount amount applied to the sale.",
    )
    gst: float = Field(
        default=18.0,
        ge=0,
        description="GST percentage applied to the transaction.",
    )
    items: list[SaleItemCreate] = Field(
        ...,
        description="List of sale items included in the order.",
    )


class SaleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique sale transaction ID.")
    invoice_number: str = Field(..., description="Generated invoice number (e.g., INV-YYYYMMDD-XXX).")

    customer_name: str = Field(..., description="Customer name.")
    customer_phone: Optional[str] = Field(default=None, description="Customer phone.")
    customer_email: Optional[str] = Field(default=None, description="Customer email.")

    subtotal: float = Field(..., description="Subtotal amount before tax and discount.")
    gst: float = Field(..., description="Calculated GST tax amount.")
    discount: float = Field(..., description="Discount amount.")
    grand_total: float = Field(..., description="Final grand total amount.")

    payment_method: str = Field(..., description="Payment method used.")
    payment_status: str = Field(..., description="Payment status (e.g., Paid, Pending).")

    created_at: datetime = Field(..., description="Timestamp of transaction creation.")

    items: list[SaleItemResponse] = Field(..., description="Associated sale line items.")


# -----------------------------
# List Response
# -----------------------------

class SaleListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    total: int = Field(..., description="Total matching sale records.")
    page: int = Field(..., description="Current page number.")
    limit: int = Field(..., description="Items per page.")
    total_pages: int = Field(..., description="Total available pages.")
    sales: list[SaleResponse] = Field(..., description="List of sale transaction records.")