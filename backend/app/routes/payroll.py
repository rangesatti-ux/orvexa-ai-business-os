from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.role import require_role
from app.models.employee import Employee
from app.models.payroll import Payroll
from app.schemas.payroll import (
    PayrollCreate,
    PayrollResponse,
    PayrollListResponse,
)


router = APIRouter(
    prefix="/payroll",
    tags=["Payroll"]
)


# ===========================
# Generate Payroll
# ===========================

@router.post(
    "/",
    response_model=PayrollResponse,
    dependencies=[Depends(require_role("Admin", "HR"))]
)
def generate_payroll(
    payroll: PayrollCreate,
    db: Session = Depends(get_db)
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == payroll.employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    existing = (
        db.query(Payroll)
        .filter(
            Payroll.employee_id == payroll.employee_id,
            Payroll.month == payroll.month
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Payroll already generated for this month"
        )

    net_salary = (
        payroll.basic_salary
        + payroll.hra
        + payroll.allowance
        + payroll.bonus
        - payroll.deduction
    )

    try:
        payroll_record = Payroll(
            employee_id=payroll.employee_id,
            month=payroll.month,
            basic_salary=payroll.basic_salary,
            hra=payroll.hra,
            allowance=payroll.allowance,
            bonus=payroll.bonus,
            deduction=payroll.deduction,
            net_salary=net_salary
        )

        db.add(payroll_record)
        db.commit()
        db.refresh(payroll_record)

        return payroll_record

    except Exception:
        db.rollback()
        raise


# ===========================
# Get Payrolls
# ===========================

@router.get(
    "/",
    response_model=PayrollListResponse
)
def get_payrolls(
    employee_id: int | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db)
):
    query = db.query(Payroll)

    if employee_id is not None:
        query = query.filter(
            Payroll.employee_id == employee_id
        )

    total = query.count()

    total_pages = (total + limit - 1) // limit

    payrolls = (
        query
        .order_by(Payroll.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "payrolls": payrolls
    }


# ===========================
# Payroll Dashboard
# ===========================

@router.get("/dashboard/stats")
def payroll_dashboard(
    db: Session = Depends(get_db)
):
    payrolls = db.query(Payroll).all()

    total_payroll = sum(
        payroll.net_salary
        for payroll in payrolls
    )

    return {
        "employees_paid": len(payrolls),
        "total_salary_paid": total_payroll
    }


# ===========================
# Get Payroll By ID
# ===========================

@router.get(
    "/{payroll_id}",
    response_model=PayrollResponse
)
def get_payroll(
    payroll_id: int,
    db: Session = Depends(get_db)
):
    payroll = (
        db.query(Payroll)
        .filter(Payroll.id == payroll_id)
        .first()
    )

    if not payroll:
        raise HTTPException(
            status_code=404,
            detail="Payroll not found"
        )

    return payroll


# ===========================
# Delete Payroll
# ===========================

@router.delete(
    "/{payroll_id}",
    dependencies=[Depends(require_role("Admin"))]
)
def delete_payroll(
    payroll_id: int,
    db: Session = Depends(get_db)
):
    payroll = (
        db.query(Payroll)
        .filter(Payroll.id == payroll_id)
        .first()
    )

    if not payroll:
        raise HTTPException(
            status_code=404,
            detail="Payroll not found"
        )

    try:
        db.delete(payroll)
        db.commit()

        return {
            "message": "Payroll deleted successfully"
        }

    except Exception:
        db.rollback()
        raise
