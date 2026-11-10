from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.employee import Employee
from app.models.department import Department
from app.models.user import User

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats", summary="Get HR & Employee Dashboard Statistics")
async def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_employees = db.query(Employee).count()

    active_employees = (
        db.query(Employee)
        .filter(func.lower(Employee.status) == "active")
        .count()
    )

    inactive_employees = (
        db.query(Employee)
        .filter(func.lower(Employee.status) == "inactive")
        .count()
    )

    # Use Department model table count with fallback to distinct employee department strings
    total_departments = db.query(Department).count()
    if total_departments == 0:
        total_departments = (
            db.query(Employee.department)
            .filter(Employee.department.isnot(None))
            .distinct()
            .count()
        )

    total_salary = (
        db.query(
            func.coalesce(
                func.sum(Employee.salary),
                0.0,
            )
        )
        .scalar()
    )

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "inactive_employees": inactive_employees,
        "departments": total_departments,
        "monthly_salary_expense": round(total_salary, 2),
    }