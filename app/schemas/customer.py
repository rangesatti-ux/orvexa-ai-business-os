from pydantic import BaseModel, EmailStr
from datetime import datetime


class CustomerCreate(BaseModel):
    customer_code: str
    full_name: str
    phone: str
    email: EmailStr | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None


class CustomerUpdate(BaseModel):
    customer_code: str
    full_name: str
    phone: str
    email: EmailStr | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None


class CustomerResponse(BaseModel):
    id: int
    customer_code: str
    full_name: str
    phone: str
    email: str | None
    address: str | None
    city: str | None
    state: str | None
    pincode: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    customers: list[CustomerResponse]