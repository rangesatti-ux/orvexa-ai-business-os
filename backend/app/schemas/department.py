from datetime import datetime
from typing import Optional, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


DepartmentStatus = Literal["Active", "Inactive"]


class DepartmentBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    department_code: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Unique code identifying the department.",
    )

    department_name: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="Display name of the department.",
    )

    description: Optional[str] = Field(
        default=None,
        description="Detailed description or overview of the department.",
    )

    manager_name: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Name of the department manager.",
    )

    manager_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="ID of the employee assigned as department manager.",
    )

    status: DepartmentStatus = Field(
        default="Active",
        description="Operational status of the department.",
    )

    @field_validator("department_code", "department_name")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be empty.")
        return value

    @field_validator("manager_name")
    @classmethod
    def clean_manager_name(cls, value: Optional[str]) -> Optional[str]:
        if value is not None:
            value = value.strip()
            return value or None
        return value


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    department_code: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=50,
        description="Updated department code.",
    )

    department_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150,
        description="Updated department name.",
    )

    description: Optional[str] = Field(
        default=None,
        description="Updated description.",
    )

    manager_name: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Updated manager name.",
    )

    manager_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="Updated manager employee ID.",
    )

    status: Optional[DepartmentStatus] = Field(
        default=None,
        description="Updated department status.",
    )

    @field_validator("department_code", "department_name")
    @classmethod
    def validate_optional_text(cls, value: Optional[str]) -> Optional[str]:
        if value is not None:
            value = value.strip()
            if not value:
                raise ValueError("This field cannot be empty.")
        return value

    @field_validator("manager_name")
    @classmethod
    def clean_manager_name(cls, value: Optional[str]) -> Optional[str]:
        if value is not None:
            value = value.strip()
            return value or None
        return value


class DepartmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique department database ID.")
    department_code: str = Field(..., description="Department code.")
    department_name: str = Field(..., description="Department name.")
    description: Optional[str] = Field(default=None, description="Department description.")
    manager_name: Optional[str] = Field(default=None, description="Manager name.")
    manager_id: Optional[int] = Field(default=None, description="Manager employee ID.")
    status: DepartmentStatus = Field(..., description="Department status.")
    total_employees: Optional[int] = Field(default=0, description="Total active employees in the department.")
    created_at: Optional[datetime] = Field(default=None, description="Creation timestamp.")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp.")