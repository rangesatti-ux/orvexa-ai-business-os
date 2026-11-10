from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    customer_code: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Unique customer code identifier.",
    )
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="Full name of the customer.",
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


class CustomerUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    customer_code: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Updated customer code.",
    )
    full_name: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Updated full name.",
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
        description="Updated address.",
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


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique customer ID.")
    customer_code: str = Field(..., description="Customer code.")
    full_name: str = Field(..., description="Customer full name.")
    phone: str = Field(..., description="Contact phone.")
    email: Optional[str] = Field(default=None, description="Email address.")
    address: Optional[str] = Field(default=None, description="Street address.")
    city: Optional[str] = Field(default=None, description="City.")
    state: Optional[str] = Field(default=None, description="State.")
    pincode: Optional[str] = Field(default=None, description="Pincode.")
    created_at: datetime = Field(..., description="Creation timestamp.")


class CustomerListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    total: int = Field(..., description="Total matching customer records.")
    page: int = Field(..., description="Current page number.")
    limit: int = Field(..., description="Items per page.")
    total_pages: int = Field(..., description="Total available pages.")
    customers: list[CustomerResponse] = Field(..., description="List of customer records.")