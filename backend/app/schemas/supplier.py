from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SupplierCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    supplier_code: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Unique code identifying the supplier.",
    )
    supplier_name: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="Name of the supplier organization.",
    )
    contact_person: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Primary contact person at the supplier.",
    )
    phone: str = Field(
        ...,
        min_length=1,
        max_length=20,
        description="Contact phone number.",
    )
    email: Optional[EmailStr] = Field(
        default=None,
        description="Email address.",
    )
    address: Optional[str] = Field(
        default=None,
        description="Street address.",
    )
    city: Optional[str] = Field(
        default=None,
        description="City.",
    )
    state: Optional[str] = Field(
        default=None,
        description="State/Province.",
    )
    pincode: Optional[str] = Field(
        default=None,
        description="Postal or PIN code.",
    )
    gst_number: Optional[str] = Field(
        default=None,
        max_length=20,
        description="GST tax identification number.",
    )


class SupplierUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    supplier_code: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Updated supplier code.",
    )
    supplier_name: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Updated supplier name.",
    )
    contact_person: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Updated contact person.",
    )
    phone: Optional[str] = Field(
        default=None,
        max_length=20,
        description="Updated phone number.",
    )
    email: Optional[EmailStr] = Field(
        default=None,
        description="Updated email address.",
    )
    address: Optional[str] = Field(
        default=None,
        description="Updated street address.",
    )
    city: Optional[str] = Field(
        default=None,
        description="Updated city.",
    )
    state: Optional[str] = Field(
        default=None,
        description="Updated state.",
    )
    pincode: Optional[str] = Field(
        default=None,
        description="Updated pincode.",
    )
    gst_number: Optional[str] = Field(
        default=None,
        max_length=20,
        description="Updated GST number.",
    )
    is_active: Optional[bool] = Field(
        default=None,
        description="Active status flag.",
    )


class SupplierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique supplier database ID.")
    supplier_code: str = Field(..., description="Supplier code.")
    supplier_name: str = Field(..., description="Supplier organization name.")
    contact_person: Optional[str] = Field(default=None, description="Contact person.")
    phone: str = Field(..., description="Contact phone.")
    email: Optional[str] = Field(default=None, description="Email address.")
    address: Optional[str] = Field(default=None, description="Address.")
    city: Optional[str] = Field(default=None, description="City.")
    state: Optional[str] = Field(default=None, description="State.")
    pincode: Optional[str] = Field(default=None, description="Pincode.")
    gst_number: Optional[str] = Field(default=None, description="GST identification number.")
    is_active: bool = Field(default=True, description="Active status.")
    created_at: datetime = Field(..., description="Creation timestamp.")


class SupplierListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    total: int = Field(..., description="Total matching supplier records.")
    page: int = Field(..., description="Current page number.")
    limit: int = Field(..., description="Items per page.")
    total_pages: int = Field(..., description="Total available pages.")
    suppliers: list[SupplierResponse] = Field(..., description="List of supplier records.")