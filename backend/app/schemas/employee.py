from datetime import date
from typing import Optional, Literal

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict,
    field_validator,
)


class EmployeeCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    employee_id: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Unique organizational employee ID code.",
    )
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Full name of the employee.",
    )
    email: EmailStr = Field(
        ...,
        description="Corporate email address for login and notifications.",
    )
    phone: Optional[str] = Field(
        default=None,
        max_length=20,
        description="Contact phone number.",
    )
    department_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="ID of the assigned department.",
    )
    manager_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="ID of the direct manager employee profile.",
    )
    department: Optional[str] = Field(
        default=None,
        description="Legacy department name string.",
    )
    position: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Job title or position.",
    )
    salary: float = Field(
        ...,
        ge=0,
        description="Monthly or annual base salary.",
    )
    joining_date: date = Field(
        ...,
        description="Date of joining the organization.",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Initial password for the linked user login account.",
    )
    role: Literal["HR", "Manager", "Employee", "Admin"] = Field(
        default="Employee",
        description="System access role.",
    )

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, v: str) -> str:
        """Automatically normalizes incoming roles case-insensitively to prevent 422 validation errors."""
        if isinstance(v, str):
            v_lower = v.lower()
            if v_lower == "hr":
                return "HR"
            elif v_lower == "manager":
                return "Manager"
            elif v_lower == "employee":
                return "Employee"
            elif v_lower == "admin":
                return "Admin"
        return v


class EmployeeUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    full_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
        description="Updated employee full name.",
    )
    email: Optional[EmailStr] = Field(
        default=None,
        description="Updated email address.",
    )
    phone: Optional[str] = Field(
        default=None,
        max_length=20,
        description="Updated phone number.",
    )
    department_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="Updated department ID.",
    )
    manager_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="Updated manager ID.",
    )
    department: Optional[str] = Field(
        default=None,
        description="Updated legacy department string.",
    )
    position: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Updated job position.",
    )
    salary: Optional[float] = Field(
        default=None,
        ge=0,
        description="Updated salary.",
    )
    status: Optional[Literal["Active", "Inactive"]] = Field(
        default=None,
        description="Employment status.",
    )


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique database ID.")
    employee_id: str = Field(..., description="Employee ID code.")
    full_name: str = Field(..., description="Employee full name.")
    email: EmailStr = Field(..., description="Email address.")
    phone: Optional[str] = Field(default=None, description="Contact phone.")
    department_id: Optional[int] = Field(default=None, description="Department ID.")
    manager_id: Optional[int] = Field(default=None, description="Manager employee ID.")
    department: Optional[str] = Field(default=None, description="Department name.")
    position: Optional[str] = Field(default=None, description="Job position.")
    salary: Optional[float] = Field(default=None, description="Salary.")
    joining_date: date = Field(..., description="Joining date.")
    status: str = Field(..., description="Employment status.")


class EmployeeListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    total: int = Field(..., description="Total matching employee count.")
    page: int = Field(..., description="Current page number.")
    limit: int = Field(..., description="Items per page.")
    total_pages: int = Field(..., description="Total available pages.")
    employees: list[EmployeeResponse] = Field(..., description="List of employee records.")
