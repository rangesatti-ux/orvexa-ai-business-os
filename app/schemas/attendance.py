from datetime import date, time, datetime
from pydantic import BaseModel


class AttendanceCheckIn(BaseModel):
    employee_id: int


class AttendanceCheckOut(BaseModel):
    employee_id: int


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    attendance_date: date
    check_in: time | None
    check_out: time | None
    working_hours: float
    status: str
    remarks: str | None
    created_at: datetime

    class Config:
        from_attributes = True