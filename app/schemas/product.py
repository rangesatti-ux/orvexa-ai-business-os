from pydantic import BaseModel
from datetime import datetime


class ProductCreate(BaseModel):
    product_code: str
    product_name: str
    category: str
    quantity: int
    price: float
    supplier: str


class ProductUpdate(BaseModel):
    product_code: str
    product_name: str
    category: str
    quantity: int
    price: float
    supplier: str


class ProductResponse(BaseModel):
    id: int
    product_code: str
    product_name: str
    category: str
    quantity: int
    price: float
    supplier: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    products: list[ProductResponse]