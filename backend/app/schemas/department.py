from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DepartmentBase(BaseModel):
    department_code: str = Field(..., min_length=1, max_length=50)
    department_name: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    manager_name: str | None = Field(default=None, max_length=150)
    status: str = "Active"


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    department_code: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    department_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    description: str | None = None
    manager_name: str | None = Field(
        default=None,
        max_length=150,
    )
    status: str | None = None


class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)