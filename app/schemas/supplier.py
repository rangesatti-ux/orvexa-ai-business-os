from datetime import datetime
from pydantic import BaseModel, EmailStr


class SupplierCreate(BaseModel):
    supplier_code: str
    supplier_name: str
    contact_person: str | None = None
    phone: str
    email: EmailStr | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    gst_number: str | None = None


class SupplierUpdate(BaseModel):
    supplier_code: str
    supplier_name: str
    contact_person: str | None = None
    phone: str
    email: EmailStr | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    gst_number: str | None = None
    is_active: bool


class SupplierResponse(BaseModel):
    id: int
    supplier_code: str
    supplier_name: str
    contact_person: str | None
    phone: str
    email: str | None
    address: str | None
    city: str | None
    state: str | None
    pincode: str | None
    gst_number: str | None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SupplierListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    suppliers: list[SupplierResponse]