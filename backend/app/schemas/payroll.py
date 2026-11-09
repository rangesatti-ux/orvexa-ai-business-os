from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class PayrollCreate(BaseModel):
    employee_id: int = Field(gt=0)
    month: str = Field(min_length=7, max_length=7, description="Format: YYYY-MM")
    basic_salary: float = Field(gt=0)
    hra: float = Field(default=0.0, ge=0)
    allowance: float = Field(default=0.0, ge=0)
    bonus: float = Field(default=0.0, ge=0)
    deduction: float = Field(default=0.0, ge=0)


class PayrollUpdate(BaseModel):
    basic_salary: Optional[float] = Field(default=None, gt=0)
    hra: Optional[float] = Field(default=None, ge=0)
    allowance: Optional[float] = Field(default=None, ge=0)
    bonus: Optional[float] = Field(default=None, ge=0)
    deduction: Optional[float] = Field(default=None, ge=0)
    payment_status: Optional[str] = Field(default=None, description="Paid or Pending")


class PayrollResponse(BaseModel):
    id: int
    employee_id: int
    month: str
    basic_salary: float
    hra: float
    allowance: float
    bonus: float
    deduction: float
    net_salary: float
    payment_status: Optional[str] = "Pending"
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PayrollListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    payrolls: list[PayrollResponse]