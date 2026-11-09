from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SupplierCreate(BaseModel):
    supplier_code: str = Field(min_length=1, max_length=50)
    supplier_name: str = Field(min_length=1, max_length=150)
    contact_person: Optional[str] = Field(default=None, max_length=150)
    phone: str = Field(min_length=1, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gst_number: Optional[str] = Field(default=None, max_length=20)


class SupplierUpdate(BaseModel):
    supplier_code: Optional[str] = Field(default=None, max_length=50)
    supplier_name: Optional[str] = Field(default=None, max_length=150)
    contact_person: Optional[str] = Field(default=None, max_length=150)
    phone: Optional[str] = Field(default=None, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gst_number: Optional[str] = Field(default=None, max_length=20)
    is_active: Optional[bool] = None


class SupplierResponse(BaseModel):
    id: int
    supplier_code: str
    supplier_name: str
    contact_person: Optional[str] = None
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gst_number: Optional[str] = None
    is_active: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupplierListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    suppliers: list[SupplierResponse]