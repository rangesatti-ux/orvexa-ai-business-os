
from datetime import date, time, datetime
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict, Field


class AttendanceCheckIn(BaseModel):
    employee_id: int = Field(gt=0)


class AttendanceCheckOut(BaseModel):
    employee_id: int = Field(gt=0)


class AttendanceUpdate(BaseModel):
    status: Optional[
        Literal["Present", "Absent", "Late", "Half Day", "Work From Home"]
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
    working_hours: float
    status: str
    remarks: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
