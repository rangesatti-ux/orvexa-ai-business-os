from datetime import date, datetime
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict, Field


PriorityType = Literal["Low", "Medium", "High", "Urgent"]
TaskStatusType = Literal["Pending", "In Progress", "Completed", "Cancelled"]


class TaskBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Title or summary of the task.",
    )
    description: Optional[str] = Field(
        default=None,
        description="Detailed description of task requirements.",
    )
    employee: Optional[str] = Field(
        default="Unassigned",
        max_length=150,
        description="Name of the assigned employee.",
    )
    assigned_to_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="ID of the employee assigned to the task.",
    )
    priority: PriorityType = Field(
        default="Medium",
        description="Task priority level (Low, Medium, High, Urgent).",
    )
    due_date: Optional[date] = Field(
        default=None,
        description="Task deadline date.",
    )
    status: TaskStatusType = Field(
        default="Pending",
        description="Current task status.",
    )


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Updated task title.",
    )
    description: Optional[str] = Field(
        default=None,
        description="Updated task description.",
    )
    employee: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Updated employee name.",
    )
    assigned_to_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="Updated assigned employee ID.",
    )
    priority: Optional[PriorityType] = Field(
        default=None,
        description="Updated task priority.",
    )
    due_date: Optional[date] = Field(
        default=None,
        description="Updated due date.",
    )
    status: Optional[TaskStatusType] = Field(
        default=None,
        description="Updated task status.",
    )


class TaskStatusUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: TaskStatusType = Field(
        ...,
        description="New task status value.",
    )


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique task database ID.")
    title: str = Field(..., description="Task title.")
    description: Optional[str] = Field(default=None, description="Task description.")
    employee: Optional[str] = Field(default="Unassigned", description="Assigned employee name.")
    assigned_to_id: Optional[int] = Field(default=None, description="Assigned employee ID.")
    priority: str = Field(..., description="Task priority.")
    due_date: Optional[date] = Field(default=None, description="Due date.")
    status: str = Field(..., description="Current status.")
    created_at: datetime = Field(..., description="Creation timestamp.")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp.")