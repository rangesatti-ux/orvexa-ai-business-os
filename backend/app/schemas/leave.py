
from datetime import date, datetime
from typing import Optional, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    EmailStr,
    model_validator,
)


class LeaveCreate(BaseModel):
    employee_id: Optional[int] = Field(default=None, gt=0)

    leave_type: str = Field(
        min_length=2,
        max_length=50,
    )

    start_date: date
    end_date: date

    reason: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("End date cannot be before start date.")
        return self


class LeaveStatusUpdate(BaseModel):
    status: Literal["Approved", "Rejected"]


class LeaveResponse(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
