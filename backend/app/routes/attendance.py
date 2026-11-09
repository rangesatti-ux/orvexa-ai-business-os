
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.user import User
from app.schemas.attendance import (
    AttendanceCheckIn,
    AttendanceCheckOut,
    AttendanceUpdate,
    AttendanceResponse,
)


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)

# Application timezone
APP_TIMEZONE = ZoneInfo("Asia/Kolkata")


def get_local_now() -> datetime:
    return datetime.now(APP_TIMEZONE)


def get_my_employee(
    db: Session,
    current_user: User,
) -> Employee:
    employee = (
        db.query(Employee)
        .filter(Employee.user_id == current_user.id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Your employee profile was not found.",
        )

    if employee.status != "Active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your employee account is inactive.",
        )

    return employee


def calculate_working_hours(
    attendance_date: date,
    check_in,
    check_out,
) -> float:
    if not check_in or not check_out:
        return 0.0

    start = datetime.combine(
        attendance_date,
        check_in,
        tzinfo=APP_TIMEZONE,
    )

    end = datetime.combine(
        attendance_date,
        check_out,
        tzinfo=APP_TIMEZONE,
    )

    # Support overnight shifts.
    if end < start:
        end += timedelta(days=1)

    hours = (end - start).total_seconds() / 3600

    if hours < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid attendance times.",
        )

    return round(hours, 2)


# --------------------------------------------------
# CHECK IN
# A user can only check in for their own profile.
# --------------------------------------------------

@router.post(
    "/check-in",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
)
def check_in(
    request: AttendanceCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    employee = get_my_employee(db, current_user)

    if employee.id != request.employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only check in for your own account.",
        )

    now = get_local_now()
    today = now.date()

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == employee.id,
            Attendance.attendance_date == today,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance already exists for today.",
        )

    try:
        attendance = Attendance(
            employee_id=employee.id,
            attendance_date=today,
            check_in=now.time().replace(tzinfo=None),
            status="Present",
            working_hours=0,
        )

        db.add(attendance)
        db.commit()
        db.refresh(attendance)

        return attendance

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance already exists for today.",
        )

    except Exception:
        db.rollback()
        raise


# --------------------------------------------------
# CHECK OUT
# A user can only check out their own attendance.
# --------------------------------------------------

@router.post(
    "/check-out",
    response_model=AttendanceResponse,
)
def check_out(
    request: AttendanceCheckOut,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    employee = get_my_employee(db, current_user)

    if employee.id != request.employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only check out your own account.",
        )

    attendance = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == employee.id,
            Attendance.check_out.is_(None),
        )
        .order_by(Attendance.attendance_date.desc())
        .first()
    )

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No open check-in record was found.",
        )

    if not attendance.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in time is missing.",
        )

    now = get_local_now()
    checkout_time = now.time().replace(tzinfo=None)

    try:
        attendance.check_out = checkout_time
        attendance.working_hours = calculate_working_hours(
            attendance.attendance_date,
            attendance.check_in,
            checkout_time,
        )

        db.commit()
        db.refresh(attendance)

        return attendance

    except Exception:
        db.rollback()
        raise


# --------------------------------------------------
# GET ATTENDANCE
# Admin / HR: all records
# Employee: own records
# Manager: own records until team assignment is added
# --------------------------------------------------

@router.get(
    "/",
    response_model=list[AttendanceResponse],
)
def get_attendance(
    employee_id: int | None = Query(default=None, gt=0),
    attendance_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()

    query = db.query(Attendance)

    if role not in {"admin", "hr"}:
        employee = get_my_employee(db, current_user)

        if employee_id is not None and employee_id != employee.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot view another employee's attendance.",
            )

        query = query.filter(
            Attendance.employee_id == employee.id
        )

    elif employee_id is not None:
        query = query.filter(
            Attendance.employee_id == employee_id
        )

    if attendance_date:
        query = query.filter(
            Attendance.attendance_date == attendance_date
        )

    return (
        query
        .order_by(
            Attendance.attendance_date.desc(),
            Attendance.id.desc(),
        )
        .limit(500)
        .all()
    )


# --------------------------------------------------
# HR ATTENDANCE CORRECTION
# HR only
# --------------------------------------------------

@router.patch(
    "/{attendance_id}",
    response_model=AttendanceResponse,
    summary="Correct Attendance",
)
def update_attendance(
    attendance_id: int,
    update_data: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("HR")),
):
    attendance = (
        db.query(Attendance)
        .filter(Attendance.id == attendance_id)
        .first()
    )

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found.",
        )

    changes = update_data.model_dump(exclude_unset=True)

    if (
        "check_in" in changes
        and changes["check_in"] is None
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in time cannot be cleared.",
        )

    if (
        "check_out" in changes
        and changes["check_out"] is None
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out time cannot be cleared.",
        )

    try:
        for key, value in changes.items():
            setattr(attendance, key, value)

        attendance.working_hours = calculate_working_hours(
            attendance.attendance_date,
            attendance.check_in,
            attendance.check_out,
        )

        db.commit()
        db.refresh(attendance)

        return attendance

    except Exception:
        db.rollback()
        raise


# --------------------------------------------------
# ATTENDANCE DASHBOARD
# Admin / HR only
# --------------------------------------------------

@router.get(
    "/dashboard",
    dependencies=[Depends(require_role("Admin", "HR"))],
)
def attendance_dashboard(
    db: Session = Depends(get_db),
):
    today = get_local_now().date()

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
        if record.check_out is not None
    )

    currently_working = sum(
        1
        for record in today_records
        if record.check_in is not None
        and record.check_out is None
    )

    return {
        "date": today.isoformat(),
        "today_present": total_present,
        "completed_attendance": checked_out,
        "currently_working": currently_working,
    }
