from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.connection import get_db
from app.models.employee import Employee
from app.models.user import User
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_employees = db.query(Employee).count()

    active_employees = db.query(Employee).filter(
        Employee.status == "Active"
    ).count()

    inactive_employees = db.query(Employee).filter(
        Employee.status == "Inactive"
    ).count()

    total_departments = db.query(
        Employee.department
    ).distinct().count()

    total_salary = db.query(
        func.sum(Employee.salary)
    ).scalar() or 0

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "inactive_employees": inactive_employees,
        "departments": total_departments,
        "monthly_salary_expense": total_salary
    }