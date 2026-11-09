from datetime import date, datetime
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict, Field


PriorityType = Literal["Low", "Medium", "High", "Urgent"]
TaskStatusType = Literal["Pending", "In Progress", "Completed", "Cancelled"]


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    employee: Optional[str] = Field(default="Unassigned", max_length=150)
    assigned_to_id: Optional[int] = Field(default=None, gt=0)
    priority: PriorityType = "Medium"
    due_date: Optional[date] = None
    status: TaskStatusType = "Pending"


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    employee: Optional[str] = Field(default=None, max_length=150)
    assigned_to_id: Optional[int] = Field(default=None, gt=0)
    priority: Optional[PriorityType] = None
    due_date: Optional[date] = None
    status: Optional[TaskStatusType] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatusType


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    employee: Optional[str] = "Unassigned"
    assigned_to_id: Optional[int] = None
    priority: str
    due_date: Optional[date] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)