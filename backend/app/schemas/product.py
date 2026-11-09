from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    product_code: str = Field(min_length=1, max_length=50)
    product_name: str = Field(min_length=1, max_length=150)
    category: str = Field(min_length=1, max_length=100)
    quantity: int = Field(default=0, ge=0)
    price: float = Field(default=0.0, ge=0)
    supplier: str = Field(min_length=1, max_length=150)


class ProductUpdate(BaseModel):
    product_code: Optional[str] = Field(default=None, max_length=50)
    product_name: Optional[str] = Field(default=None, max_length=150)
    category: Optional[str] = Field(default=None, max_length=100)
    quantity: Optional[int] = Field(default=None, ge=0)
    price: Optional[float] = Field(default=None, ge=0)
    supplier: Optional[str] = Field(default=None, max_length=150)


class ProductResponse(BaseModel):
    id: int
    product_code: str
    product_name: str
    category: str
    quantity: int
    price: float
    supplier: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    products: list[ProductResponse]