from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class PayrollCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    employee_id: int = Field(
        ...,
        gt=0,
        description="ID of the employee receiving payroll.",
    )
    month: str = Field(
        ...,
        min_length=7,
        max_length=7,
        description="Payroll period format: YYYY-MM.",
    )
    basic_salary: float = Field(
        ...,
        gt=0,
        description="Base salary amount.",
    )
    hra: float = Field(
        default=0.0,
        ge=0,
        description="House Rent Allowance.",
    )
    allowance: float = Field(
        default=0.0,
        ge=0,
        description="Additional allowances.",
    )
    bonus: float = Field(
        default=0.0,
        ge=0,
        description="Performance or festive bonus.",
    )
    deduction: float = Field(
        default=0.0,
        ge=0,
        description="Total deductions (e.g., tax, provident fund).",
    )


class PayrollUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    basic_salary: Optional[float] = Field(
        default=None,
        gt=0,
        description="Updated basic salary.",
    )
    hra: Optional[float] = Field(
        default=None,
        ge=0,
        description="Updated HRA.",
    )
    allowance: Optional[float] = Field(
        default=None,
        ge=0,
        description="Updated allowance.",
    )
    bonus: Optional[float] = Field(
        default=None,
        ge=0,
        description="Updated bonus.",
    )
    deduction: Optional[float] = Field(
        default=None,
        ge=0,
        description="Updated deductions.",
    )
    payment_status: Optional[str] = Field(
        default=None,
        description="Payment status: Paid or Pending.",
    )


class PayrollResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique payroll record ID.")
    employee_id: int = Field(..., description="Associated employee ID.")
    month: str = Field(..., description="Payroll period month (YYYY-MM).")
    basic_salary: float = Field(..., description="Basic salary.")
    hra: float = Field(..., description="House Rent Allowance.")
    allowance: float = Field(..., description="Allowances.")
    bonus: float = Field(..., description="Bonus.")
    deduction: float = Field(..., description="Deductions.")
    net_salary: float = Field(..., description="Calculated net salary.")
    payment_status: Optional[str] = Field(default="Pending", description="Payment status.")
    created_at: Optional[datetime] = Field(default=None, description="Creation timestamp.")


class PayrollListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    total: int = Field(..., description="Total matching payroll records.")
    page: int = Field(..., description="Current page number.")
    limit: int = Field(..., description="Items per page.")
    total_pages: int = Field(..., description="Total available pages.")
    payrolls: list[PayrollResponse] = Field(..., description="List of payroll records.")