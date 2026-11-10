from datetime import date, datetime, timedelta
from typing import Optional
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

APP_TIMEZONE = ZoneInfo("Asia/Kolkata")


def get_local_now() -> datetime:
    return datetime.now(APP_TIMEZONE)


def get_my_employee(
    db: Session,
    current_user: User,
) -> Employee:
    # Query employee by linked user_id or matching email address
    employee = (
        db.query(Employee)
        .filter(
            (Employee.user_id == current_user.id)
            | (Employee.email == current_user.email)
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Your employee profile was not found.",
        )

    is_active = getattr(employee, "is_active", True)
    emp_status = getattr(employee, "status", "Active")
    if not is_active or str(emp_status).strip().casefold() != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your employee account is inactive. Please contact HR.",
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

    # Support overnight shifts spanning past midnight
    if end < start:
        end += timedelta(days=1)

    hours = (end - start).total_seconds() / 3600.0

    if hours < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid attendance check-in/check-out timing sequence.",
        )

    return round(hours, 2)


# --------------------------------------------------
# CHECK IN
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
    target_id = request.employee_id or employee.id

    if employee.id != target_id and str(current_user.role).strip().casefold() not in {"admin", "hr"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only check in for your own employee account.",
        )

    now = get_local_now()
    today = now.date()

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == target_id,
            Attendance.attendance_date == today,
        )
        .first()
    )

    if existing:
        if existing.check_in and not existing.check_out:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Already checked in for today.",
            )
        if existing.check_out:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Attendance shift already completed for today.",
            )

    try:
        remarks_val = getattr(request, "remarks", None)
        attendance = Attendance(
            employee_id=target_id,
            attendance_date=today,
            check_in=now.time().replace(tzinfo=None),
            status="Present",
            working_hours=0.0,
            remarks=remarks_val,
        )

        db.add(attendance)
        db.commit()
        db.refresh(attendance)
        return attendance

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance record already exists for today.",
        )
    except Exception:
        db.rollback()
        raise


# --------------------------------------------------
# CHECK OUT
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
    target_id = request.employee_id or employee.id

    if employee.id != target_id and str(current_user.role).strip().casefold() not in {"admin", "hr"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only check out your own employee account.",
        )

    attendance = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == target_id,
            Attendance.check_out.is_(None),
        )
        .order_by(Attendance.attendance_date.desc())
        .first()
    )

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No open check-in record was found to check out.",
        )

    if not attendance.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in timestamp is missing from record.",
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

        remarks_val = getattr(request, "remarks", None)
        if remarks_val:
            attendance.remarks = remarks_val

        db.commit()
        db.refresh(attendance)
        return attendance

    except Exception:
        db.rollback()
        raise


# --------------------------------------------------
# GET ATTENDANCE LIST
# --------------------------------------------------

@router.get(
    "/",
    response_model=list[AttendanceResponse],
)
def get_attendance(
    employee_id: Optional[int] = Query(default=None, gt=0),
    attendance_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()
    query = db.query(Attendance)

    if role not in {"admin", "hr"}:
        employee = get_my_employee(db, current_user)

        if role == "manager":
            subordinates = (
                db.query(Employee.id)
                .filter(Employee.manager_id == employee.id)
                .all()
            )
            allowed_ids = {employee.id} | {sub.id for sub in subordinates}

            if employee_id is not None:
                if employee_id not in allowed_ids:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You don't have permission to view this employee's attendance.",
                    )
                query = query.filter(Attendance.employee_id == employee_id)
            else:
                query = query.filter(Attendance.employee_id.in_(allowed_ids))
        else:
            if employee_id is not None and employee_id != employee.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only view your own attendance records.",
                )
            query = query.filter(Attendance.employee_id == employee.id)

    elif employee_id is not None:
        query = query.filter(Attendance.employee_id == employee_id)

    if attendance_date:
        query = query.filter(Attendance.attendance_date == attendance_date)

    return (
        query.order_by(
            Attendance.attendance_date.desc(),
            Attendance.id.desc(),
        )
        .limit(500)
        .all()
    )


# --------------------------------------------------
# GET TEAM ATTENDANCE (Manager)
# --------------------------------------------------

@router.get(
    "/team",
    response_model=list[AttendanceResponse],
    summary="Get Team Attendance",
)
def get_team_attendance(
    target_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    manager_employee = get_my_employee(db, current_user)
    subordinates = (
        db.query(Employee.id)
        .filter(Employee.manager_id == manager_employee.id)
        .all()
    )
    subordinate_ids = [sub.id for sub in subordinates]

    if not subordinate_ids:
        return []

    query = db.query(Attendance).filter(
        Attendance.employee_id.in_(subordinate_ids)
    )

    if target_date:
        query = query.filter(Attendance.attendance_date == target_date)

    return query.order_by(Attendance.attendance_date.desc()).all()


# --------------------------------------------------
# HR / ADMIN ATTENDANCE CORRECTION
# --------------------------------------------------

@router.patch(
    "/{attendance_id}",
    response_model=AttendanceResponse,
    summary="Correct Attendance Record",
)
def update_attendance(
    attendance_id: int,
    update_data: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("HR", "Admin")),
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

    if "check_in" in changes and changes["check_in"] is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in time cannot be cleared.",
        )

    if "check_out" in changes and changes["check_out"] is None:
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
# ATTENDANCE DASHBOARD SUMMARY
# --------------------------------------------------

@router.get(
    "/dashboard",
)
def attendance_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()
    if role not in {"admin", "hr"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dashboard summary requires Admin or HR privileges.",
        )

    today = get_local_now().date()

    today_records = (
        db.query(Attendance)
        .filter(Attendance.attendance_date == today)
        .all()
    )

    total_present = len(today_records)
    checked_out = sum(1 for r in today_records if r.check_out is not None)
    currently_working = sum(
        1 for r in today_records if r.check_in is not None and r.check_out is None
    )

    return {
        "date": today.isoformat(),
        "today_present": total_present,
        "completed_attendance": checked_out,
        "currently_working": currently_working,
    }