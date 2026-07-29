from datetime import date, datetime
from pydantic import BaseModel


class LeaveCreate(BaseModel):
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: str


class LeaveStatusUpdate(BaseModel):
    status: str


class LeaveResponse(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True