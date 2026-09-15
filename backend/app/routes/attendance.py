from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.role import require_role
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.schemas.attendance import (
    AttendanceCheckIn,
    AttendanceCheckOut,
    AttendanceResponse,
)


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


@router.post(
    "/check-in",
    response_model=AttendanceResponse,
    dependencies=[
        Depends(require_role("Admin", "HR", "Employee"))
    ],
)
def check_in(
    request: AttendanceCheckIn,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == request.employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    today = date.today()

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == request.employee_id,
            Attendance.attendance_date == today,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Already checked in today",
        )

    try:
        attendance = Attendance(
            employee_id=request.employee_id,
            attendance_date=today,
            check_in=datetime.now().time(),
            status="Present",
        )

        db.add(attendance)
        db.commit()
        db.refresh(attendance)

        return attendance

    except Exception:
        db.rollback()
        raise


@router.post(
    "/check-out",
    response_model=AttendanceResponse,
    dependencies=[
        Depends(require_role("Admin", "HR", "Employee"))
    ],
)
def check_out(
    request: AttendanceCheckOut,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == request.employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    today = date.today()

    attendance = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == request.employee_id,
            Attendance.attendance_date == today,
        )
        .first()
    )

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Check-in not found",
        )

    if attendance.check_out:
        raise HTTPException(
            status_code=400,
            detail="Already checked out",
        )

    if not attendance.check_in:
        raise HTTPException(
            status_code=400,
            detail="Invalid attendance record: check-in time is missing",
        )

    try:
        now = datetime.now()

        attendance.check_out = now.time()

        check_in_datetime = datetime.combine(
            today,
            attendance.check_in,
        )

        working_hours = (
            now - check_in_datetime
        ).total_seconds() / 3600

        if working_hours < 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid check-in time",
            )

        attendance.working_hours = round(
            working_hours,
            2,
        )

        db.commit()
        db.refresh(attendance)

        return attendance

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise


@router.get(
    "/",
    response_model=list[AttendanceResponse],
)
def get_attendance(
    employee_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Attendance)

    if employee_id is not None:
        query = query.filter(
            Attendance.employee_id == employee_id
        )

    return (
        query
        .order_by(
            Attendance.attendance_date.desc()
        )
        .all()
    )


@router.get("/dashboard")
def attendance_dashboard(
    db: Session = Depends(get_db),
):
    today = date.today()

    today_records = (
        db.query(Attendance)
        .filter(
            Attendance.attendance_date == today
        )
        .all()
    )

    total_present = len(today_records)

    checked_out = sum(
        1
        for record in today_records
        if record.check_out
    )

    return {
        "today_present": total_present,
        "completed_attendance": checked_out,
    }