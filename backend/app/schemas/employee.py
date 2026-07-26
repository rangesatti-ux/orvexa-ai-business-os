from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional


class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    phone: str
    department: str
    position: str
    salary: float
    joining_date: date


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    salary: Optional[float] = None
    status: Optional[str] = None


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: EmailStr
    phone: str
    department: str
    position: str
    salary: float
    joining_date: date
    status: str

    class Config:
        from_attributes = True

class EmployeeListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    employees: list[EmployeeResponse]