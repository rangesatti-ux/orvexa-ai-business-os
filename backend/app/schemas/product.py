from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    product_code: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Unique code identifying the product.",
    )
    product_name: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="Name of the product.",
    )
    category: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Product category.",
    )
    quantity: int = Field(
        default=0,
        ge=0,
        description="Current stock quantity.",
    )
    price: float = Field(
        default=0.0,
        ge=0,
        description="Unit price of the product.",
    )
    supplier: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="Name or identifier of the supplier.",
    )


class ProductUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    product_code: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Updated product code.",
    )
    product_name: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Updated product name.",
    )
    category: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Updated category.",
    )
    quantity: Optional[int] = Field(
        default=None,
        ge=0,
        description="Updated stock quantity.",
    )
    price: Optional[float] = Field(
        default=None,
        ge=0,
        description="Updated unit price.",
    )
    supplier: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Updated supplier.",
    )


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique product database ID.")
    product_code: str = Field(..., description="Product code.")
    product_name: str = Field(..., description="Product name.")
    category: str = Field(..., description="Product category.")
    quantity: int = Field(..., description="Available stock quantity.")
    price: float = Field(..., description="Unit price.")
    supplier: str = Field(..., description="Supplier name.")
    created_at: datetime = Field(..., description="Creation timestamp.")


class ProductListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    total: int = Field(..., description="Total matching product count.")
    page: int = Field(..., description="Current page number.")
    limit: int = Field(..., description="Items per page.")
    total_pages: int = Field(..., description="Total available pages.")
    products: list[ProductResponse] = Field(..., description="List of product records.")