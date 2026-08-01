from datetime import datetime
from pydantic import BaseModel, Field


class PayrollCreate(BaseModel):
    employee_id: int
    month: str
    basic_salary: float = Field(gt=0)
    hra: float = 0
    allowance: float = 0
    bonus: float = 0
    deduction: float = 0


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
    created_at: datetime

    class Config:
        from_attributes = True


class PayrollListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    payrolls: list[PayrollResponse]