from typing import Optional

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
from app.models.employee import Employee
from app.models.payroll import Payroll
from app.models.user import User
from app.schemas.payroll import (
    PayrollCreate,
    PayrollUpdate,
    PayrollResponse,
    PayrollListResponse,
)
from app.services.audit_service import create_audit_log

# Compatibility layer for role dependencies
try:
    from app.dependencies.role import require_role
except ImportError:
    from app.dependencies.role import require_roles as require_role


router = APIRouter(
    prefix="/payroll",
    tags=["Payroll"],
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

    is_active = getattr(employee, "is_active", True)
    emp_status = getattr(employee, "status", "Active")
    if not is_active or emp_status != "Active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your employee account is inactive.",
        )

    return employee


# ===========================
# Generate Payroll
# Admin and HR only
# ===========================

@router.post(
    "/",
    response_model=PayrollResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate Payroll",
)
def generate_payroll(
    payroll_in: PayrollCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin", "HR"] if isinstance(require_role, type) else "HR")),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == payroll_in.employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    existing = (
        db.query(Payroll)
        .filter(
            Payroll.employee_id == payroll_in.employee_id,
            Payroll.month == payroll_in.month,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payroll already generated for this month.",
        )

    net_salary = (
        payroll_in.basic_salary
        + payroll_in.hra
        + payroll_in.allowance
        + payroll_in.bonus
        - payroll_in.deduction
    )

    try:
        payroll_record = Payroll(
            employee_id=payroll_in.employee_id,
            month=payroll_in.month,
            basic_salary=payroll_in.basic_salary,
            hra=payroll_in.hra,
            allowance=payroll_in.allowance,
            bonus=payroll_in.bonus,
            deduction=payroll_in.deduction,
            net_salary=net_salary,
        )

        db.add(payroll_record)
        db.flush()

        create_audit_log(
            db=db,
            username=current_user.email,
            module="Payroll",
            action=f"Generated payroll for {employee.full_name} for period {payroll_in.month}",
        )

        db.commit()
        db.refresh(payroll_record)

        return payroll_record

    except Exception:
        db.rollback()
        raise


# ===========================
# Get Payrolls
# Admin / HR: all payroll records
# Employee: own payroll records
# ===========================

@router.get(
    "/",
    response_model=PayrollListResponse,
    summary="Get Payroll Records",
)
def get_payrolls(
    employee_id: Optional[int] = Query(default=None, gt=0),
    month: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()
    query = db.query(Payroll)

    if role not in {"admin", "hr"}:
        employee = get_my_employee(db, current_user)
        if employee_id is not None and employee_id != employee.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot view another employee's payroll.",
            )
        query = query.filter(Payroll.employee_id == employee.id)
    elif employee_id is not None:
        query = query.filter(Payroll.employee_id == employee_id)

    if month:
        query = query.filter(Payroll.month == month)

    total = query.count()
    total_pages = (total + limit - 1) // limit
    skip = (page - 1) * limit

    payrolls = (
        query
        .order_by(Payroll.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "payrolls": payrolls,
    }


# ===========================
# Payroll Dashboard
# Admin and HR only
# ===========================

@router.get(
    "/dashboard/stats",
    summary="Payroll Dashboard Statistics",
)
def payroll_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()
    if role not in {"admin", "hr"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dashboard access requires Admin or HR role.",
        )

    payrolls = db.query(Payroll).all()

    total_payroll = sum(payroll.net_salary for payroll in payrolls)

    return {
        "employees_paid": len(payrolls),
        "total_salary_paid": round(total_payroll, 2),
    }


# ===========================
# Get Payroll By ID
# ===========================

@router.get(
    "/{payroll_id}",
    response_model=PayrollResponse,
    summary="Get Single Payroll Record",
)
def get_payroll(
    payroll_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payroll = (
        db.query(Payroll)
        .filter(Payroll.id == payroll_id)
        .first()
    )

    if not payroll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll record not found.",
        )

    role = str(current_user.role or "").strip().casefold()

    if role not in {"admin", "hr"}:
        employee = get_my_employee(db, current_user)
        if payroll.employee_id != employee.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot view another employee's payroll statement.",
            )

    return payroll


# ===========================
# Update Payroll
# Admin and HR only
# ===========================

@router.put(
    "/{payroll_id}",
    response_model=PayrollResponse,
    summary="Update Payroll Record",
)
def update_payroll(
    payroll_id: int,
    payroll_in: PayrollUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin", "HR"] if isinstance(require_role, type) else "HR")),
):
    payroll = (
        db.query(Payroll)
        .filter(Payroll.id == payroll_id)
        .first()
    )

    if not payroll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll record not found.",
        )

    update_data = payroll_in.model_dump(exclude_unset=True)

    try:
        for key, value in update_data.items():
            setattr(payroll, key, value)

        # Recalculate net salary if financial fields were updated
        payroll.net_salary = round(
            payroll.basic_salary
            + payroll.hra
            + payroll.allowance
            + payroll.bonus
            - payroll.deduction,
            2,
        )

        create_audit_log(
            db=db,
            username=current_user.email,
            module="Payroll",
            action=f"Updated payroll record #{payroll.id}",
        )

        db.commit()
        db.refresh(payroll)

        return payroll

    except Exception:
        db.rollback()
        raise


# ===========================
# Delete Payroll
# Admin only
# ===========================

@router.delete(
    "/{payroll_id}",
    summary="Delete Payroll Record",
)
def delete_payroll(
    payroll_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin"] if isinstance(require_role, type) else "Admin")),
):
    payroll = (
        db.query(Payroll)
        .filter(Payroll.id == payroll_id)
        .first()
    )

    if not payroll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll record not found.",
        )

    try:
        create_audit_log(
            db=db,
            username=current_user.email,
            module="Payroll",
            action=f"Deleted payroll record #{payroll.id}",
        )

        db.delete(payroll)
        db.commit()

        return {
            "message": "Payroll deleted successfully."
        }

    except Exception:
        db.rollback()
        raise