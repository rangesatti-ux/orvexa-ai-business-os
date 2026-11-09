from datetime import date
from typing import Optional, Literal

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict,
)


class EmployeeCreate(BaseModel):
    employee_id: str = Field(min_length=1, max_length=50)
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr

    phone: Optional[str] = None

    # Department relationship
    department_id: Optional[int] = Field(default=None, gt=0)

    # Direct manager assignment
    manager_id: Optional[int] = Field(default=None, gt=0)

    # Retained for backward compatibility
    department: Optional[str] = None

    position: Optional[str] = None
    salary: float = Field(ge=0)
    joining_date: date

    # Login account details
    password: str = Field(min_length=8, max_length=128)

    role: Literal[
        "HR",
        "Manager",
        "Employee",
    ] = "Employee"


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    # Department relationship
    department_id: Optional[int] = Field(default=None, gt=0)

    # Direct manager assignment or reassignment.
    # Set to null to remove the current manager.
    manager_id: Optional[int] = Field(default=None, gt=0)

    # Retained for backward compatibility
    department: Optional[str] = None

    position: Optional[str] = None
    salary: Optional[float] = Field(default=None, ge=0)
    status: Optional[Literal["Active", "Inactive"]] = None


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None

    department_id: Optional[int] = None
    manager_id: Optional[int] = None

    department: Optional[str] = None

    position: Optional[str] = None
    salary: Optional[float] = None
    joining_date: date
    status: str

    model_config = ConfigDict(from_attributes=True)


class EmployeeListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    employees: list[EmployeeResponse]