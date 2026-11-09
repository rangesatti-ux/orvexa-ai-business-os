from datetime import date, time, datetime
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict, Field


class AttendanceCheckIn(BaseModel):
    employee_id: Optional[int] = Field(default=None, gt=0)
    remarks: Optional[str] = Field(default=None, max_length=255)


class AttendanceCheckOut(BaseModel):
    employee_id: Optional[int] = Field(default=None, gt=0)
    remarks: Optional[str] = Field(default=None, max_length=255)


class AttendanceCreate(BaseModel):
    employee_id: int = Field(gt=0)
    attendance_date: date
    status: Optional[
        Literal["Present", "Absent", "Late", "Half Day", "Work From Home", "Leave"]
    ] = "Present"
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    remarks: Optional[str] = Field(default=None, max_length=255)


class AttendanceUpdate(BaseModel):
    status: Optional[
        Literal["Present", "Absent", "Late", "Half Day", "Work From Home", "Leave"]
    ] = None

    check_in: Optional[time] = None
    check_out: Optional[time] = None
    remarks: Optional[str] = Field(default=None, max_length=255)


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    attendance_date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    working_hours: Optional[float] = 0.0
    status: str
    remarks: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AttendanceSummary(BaseModel):
    total_days: int
    present_days: int
    absent_days: int
    leave_days: int
    total_hours: float