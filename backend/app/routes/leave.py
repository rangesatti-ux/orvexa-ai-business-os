
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role
from app.models.employee import Employee
from app.models.leave import Leave
from app.models.user import User
from app.schemas.leave import (
    LeaveCreate,
    LeaveStatusUpdate,
    LeaveResponse,
)
from app.services.audit_service import create_audit_log


router = APIRouter(
    prefix="/leaves",
    tags=["Leaves"],
)


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


# APPLY FOR LEAVE
@router.post(
    "/",
    response_model=LeaveResponse,
    status_code=status.HTTP_201_CREATED,
)
def apply_leave(
    request: LeaveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()

    # Employees and managers can apply only for themselves.
    if role not in {"admin", "hr"}:
        employee = get_my_employee(db, current_user)

        if (
            request.employee_id is not None
            and request.employee_id != employee.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only apply for your own leave.",
            )

    else:
        if request.employee_id is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Employee ID is required when HR or Admin applies on behalf of an employee.",
            )

        employee = (
            db.query(Employee)
            .filter(Employee.id == request.employee_id)
            .first()
        )

        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found.",
            )

    if employee.status != "Active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot apply leave for an inactive employee.",
        )

    if request.end_date < request.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be before start date.",
        )

    overlapping_leave = (
        db.query(Leave)
        .filter(
            Leave.employee_id == employee.id,
            Leave.status.in_(["Pending", "Approved"]),
            Leave.start_date <= request.end_date,
            Leave.end_date >= request.start_date,
        )
        .first()
    )

    if overlapping_leave:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An overlapping pending or approved leave request already exists.",
        )

    try:
        leave = Leave(
            employee_id=employee.id,
            leave_type=request.leave_type,
            start_date=request.start_date,
            end_date=request.end_date,
            reason=request.reason,
            status="Pending",
        )

        db.add(leave)
        db.flush()

        create_audit_log(
            db=db,
            username=current_user.email,
            module="Leave",
            action=f"Created leave request for {employee.full_name}",
        )

        db.commit()
        db.refresh(leave)

        return leave

    except Exception:
        db.rollback()
        raise


# GET LEAVE REQUESTS
@router.get(
    "/",
    response_model=list[LeaveResponse],
)
def get_leaves(
    employee_id: int | None = Query(default=None, gt=0),
    status_filter: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()

    query = db.query(Leave)

    if role not in {"admin", "hr"}:
        employee = get_my_employee(db, current_user)

        if employee_id is not None and employee_id != employee.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot view another employee's leave requests.",
            )

        query = query.filter(Leave.employee_id == employee.id)

    elif employee_id is not None:
        query = query.filter(Leave.employee_id == employee_id)

    if status_filter:
        allowed_statuses = {"Pending", "Approved", "Rejected"}

        if status_filter not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid leave status.",
            )

        query = query.filter(Leave.status == status_filter)

    return (
        query
        .order_by(Leave.created_at.desc())
        .limit(500)
        .all()
    )


# LEAVE DASHBOARD
@router.get(
    "/dashboard/stats",
    dependencies=[Depends(require_role("Admin", "HR"))],
)
def leave_dashboard(
    db: Session = Depends(get_db),
):
    total = db.query(Leave).count()

    approved = (
        db.query(Leave)
        .filter(Leave.status == "Approved")
        .count()
    )

    pending = (
        db.query(Leave)
        .filter(Leave.status == "Pending")
        .count()
    )

    rejected = (
        db.query(Leave)
        .filter(Leave.status == "Rejected")
        .count()
    )

    return {
        "total_requests": total,
        "approved": approved,
        "pending": pending,
        "rejected": rejected,
    }


# GET SINGLE LEAVE REQUEST
@router.get(
    "/{leave_id}",
    response_model=LeaveResponse,
)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    leave = (
        db.query(Leave)
        .filter(Leave.id == leave_id)
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found.",
        )

    role = str(current_user.role or "").strip().casefold()

    if role not in {"admin", "hr"}:
        employee = get_my_employee(db, current_user)

        if leave.employee_id != employee.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot view this leave request.",
            )

    return leave


# APPROVE / REJECT LEAVE
@router.put(
    "/{leave_id}/status",
    response_model=LeaveResponse,
)
def update_leave_status(
    leave_id: int,
    request: LeaveStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    leave = (
        db.query(Leave)
        .filter(Leave.id == leave_id)
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found.",
        )

    if leave.status != "Pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only pending leave requests can be reviewed.",
        )

    try:
        leave.status = request.status

        create_audit_log(
            db=db,
            username=current_user.email,
            module="Leave",
            action=f"{request.status} leave request #{leave.id}",
        )

        db.commit()
        db.refresh(leave)

        return leave

    except Exception:
        db.rollback()
        raise


# DELETE LEAVE REQUEST
@router.delete(
    "/{leave_id}",
    dependencies=[Depends(require_role("Admin"))],
)
def delete_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    leave = (
        db.query(Leave)
        .filter(Leave.id == leave_id)
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found.",
        )

    if leave.status != "Pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only pending leave requests can be deleted.",
        )

    try:
        create_audit_log(
            db=db,
            username=current_user.email,
            module="Leave",
            action=f"Deleted pending leave request #{leave.id}",
        )

        db.delete(leave)
        db.commit()

        return {
            "message": "Leave request deleted successfully."
        }

    except Exception:
        db.rollback()
        raise
