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
    department_code: str = Field(
        min_length=1,
        max_length=50,
    )

    department_name: str = Field(
        min_length=1,
        max_length=150,
    )

    description: Optional[str] = None

    manager_name: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    manager_id: Optional[int] = Field(default=None, gt=0)

    status: DepartmentStatus = "Active"

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
    department_code: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    department_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    description: Optional[str] = None

    manager_name: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    manager_id: Optional[int] = Field(default=None, gt=0)

    status: Optional[DepartmentStatus] = None

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
    id: int
    department_code: str
    department_name: str
    description: Optional[str] = None
    manager_name: Optional[str] = None
    manager_id: Optional[int] = None
    status: DepartmentStatus
    total_employees: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)