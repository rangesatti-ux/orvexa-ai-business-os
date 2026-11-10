from datetime import date, time, datetime
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict, Field


class AttendanceCheckIn(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    employee_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="Optional employee ID when checking in on behalf of someone else.",
    )
    remarks: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Optional remarks or notes for check-in.",
    )


class AttendanceCheckOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    employee_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="Optional employee ID when checking out on behalf of someone else.",
    )
    remarks: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Optional remarks or notes for check-out.",
    )


class AttendanceCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    employee_id: int = Field(
        ...,
        gt=0,
        description="ID of the employee.",
    )
    attendance_date: date = Field(
        ...,
        description="Date of the attendance record.",
    )
    status: Optional[
        Literal["Present", "Absent", "Late", "Half Day", "Work From Home", "Leave"]
    ] = Field(
        default="Present",
        description="Attendance status.",
    )
    check_in: Optional[time] = Field(
        default=None,
        description="Check-in timestamp.",
    )
    check_out: Optional[time] = Field(
        default=None,
        description="Check-out timestamp.",
    )
    remarks: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Administrative or employee remarks.",
    )


class AttendanceUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: Optional[
        Literal["Present", "Absent", "Late", "Half Day", "Work From Home", "Leave"]
    ] = Field(
        default=None,
        description="Updated attendance status.",
    )
    check_in: Optional[time] = Field(
        default=None,
        description="Updated check-in time.",
    )
    check_out: Optional[time] = Field(
        default=None,
        description="Updated check-out time.",
    )
    remarks: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Updated remarks.",
    )


class AttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique attendance record ID.")
    employee_id: int = Field(..., description="Associated employee ID.")
    attendance_date: date = Field(..., description="Date of attendance.")
    check_in: Optional[time] = Field(default=None, description="Check-in time.")
    check_out: Optional[time] = Field(default=None, description="Check-out time.")
    working_hours: Optional[float] = Field(default=0.0, description="Total working hours calculated.")
    status: str = Field(..., description="Current status.")
    remarks: Optional[str] = Field(default=None, description="Recorded remarks.")
    created_at: Optional[datetime] = Field(default=None, description="Timestamp when record was created.")


class AttendanceSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    total_days: int = Field(..., description="Total tracked days.")
    present_days: int = Field(..., description="Total days marked present.")
    absent_days: int = Field(..., description="Total days marked absent.")
    leave_days: int = Field(..., description="Total days on approved leave.")
    total_hours: float = Field(..., description="Cumulative working hours.")