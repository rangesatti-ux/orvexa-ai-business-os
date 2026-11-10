from datetime import date, datetime
from typing import Optional, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


class LeaveCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    employee_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="Optional employee ID when applying on behalf of someone else (Admin/HR).",
    )

    leave_type: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Type of leave (e.g., Casual Leave, Sick Leave, Paid Leave).",
    )

    start_date: date = Field(
        ...,
        description="Start date of the leave period.",
    )
    end_date: date = Field(
        ...,
        description="End date of the leave period.",
    )

    reason: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Reason or justification for taking leave.",
    )

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("End date cannot be before start date.")
        return self


class LeaveStatusUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: Literal["Approved", "Rejected"] = Field(
        ...,
        description="New review status for the leave request.",
    )
    rejection_reason: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Reason for rejection if the leave request is rejected.",
    )


class LeaveResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique leave request ID.")
    employee_id: int = Field(..., description="ID of the employee requesting leave.")
    leave_type: str = Field(..., description="Type of leave.")
    start_date: date = Field(..., description="Start date.")
    end_date: date = Field(..., description="End date.")
    reason: Optional[str] = Field(default=None, description="Reason for leave.")
    status: str = Field(..., description="Current request status (Pending, Approved, Rejected).")
    rejection_reason: Optional[str] = Field(default=None, description="Rejection note if applicable.")
    created_at: Optional[datetime] = Field(default=None, description="Timestamp of request creation.")


class LeaveStats(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    total_requested: int = Field(..., description="Total number of leave requests.")
    approved: int = Field(..., description="Total approved leave requests.")
    pending: int = Field(..., description="Total pending leave requests.")
    rejected: int = Field(..., description="Total rejected leave requests.")