from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.role import require_role
from app.models.employee import Employee
from app.models.leave import Leave
from app.schemas.leave import (
    LeaveCreate,
    LeaveStatusUpdate,
    LeaveResponse,
)

router = APIRouter(
    prefix="/leave",
    tags=["Leave Management"]
)


@router.post(
    "/",
    response_model=LeaveResponse,
    dependencies=[Depends(require_role("Employee", "HR", "Admin"))]
)
def apply_leave(
    request: LeaveCreate,
    db: Session = Depends(get_db)
):

    employee = db.query(Employee).filter(
        Employee.id == request.employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    leave = Leave(
        employee_id=request.employee_id,
        leave_type=request.leave_type,
        start_date=request.start_date,
        end_date=request.end_date,
        reason=request.reason,
        status="Pending"
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave


@router.get(
    "/",
    response_model=list[LeaveResponse]
)
def get_leaves(
    employee_id: int | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db)
):

    query = db.query(Leave)

    if employee_id:
        query = query.filter(
            Leave.employee_id == employee_id
        )

    if status:
        query = query.filter(
            Leave.status == status
        )

    return query.order_by(
        Leave.created_at.desc()
    ).all()


@router.get(
    "/{leave_id}",
    response_model=LeaveResponse
)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db)
):

    leave = db.query(Leave).filter(
        Leave.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    return leave


@router.put(
    "/{leave_id}/status",
    response_model=LeaveResponse,
    dependencies=[Depends(require_role("Admin", "HR"))]
)
def update_leave_status(
    leave_id: int,
    request: LeaveStatusUpdate,
    db: Session = Depends(get_db)
):

    leave = db.query(Leave).filter(
        Leave.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    if request.status not in [
        "Approved",
        "Rejected",
        "Pending"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    leave.status = request.status

    db.commit()
    db.refresh(leave)

    return leave


@router.delete(
    "/{leave_id}",
    dependencies=[Depends(require_role("Admin"))]
)
def delete_leave(
    leave_id: int,
    db: Session = Depends(get_db)
):

    leave = db.query(Leave).filter(
        Leave.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    db.delete(leave)

    db.commit()

    return {
        "message": "Leave request deleted successfully"
    }


@router.get("/dashboard/stats")
def leave_dashboard(
    db: Session = Depends(get_db)
):

    total = db.query(Leave).count()

    approved = db.query(Leave).filter(
        Leave.status == "Approved"
    ).count()

    pending = db.query(Leave).filter(
        Leave.status == "Pending"
    ).count()

    rejected = db.query(Leave).filter(
        Leave.status == "Rejected"
    ).count()

    return {
        "total_requests": total,
        "approved": approved,
        "pending": pending,
        "rejected": rejected
    }