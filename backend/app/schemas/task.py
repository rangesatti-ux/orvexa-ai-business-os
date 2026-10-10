from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    employee: str = Field(default="Unassigned", max_length=150)
    priority: str = "Medium"
    due_date: date | None = None
    status: str = "Pending"


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    employee: str | None = Field(default=None, max_length=150)
    priority: str | None = None
    due_date: date | None = None
    status: str | None = None


class TaskResponse(TaskCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)