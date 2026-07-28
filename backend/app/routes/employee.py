from app.dependencies.role import require_role
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.employee import Employee
from app.models.user import User
from app.services.audit_service import create_audit_log
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse
)

router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


@router.post(
    "/",
    summary="Create Employee",
    description="Creates a new employee and stores the employee information in the database."
)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR"))
):

    existing_employee = db.query(Employee).filter(
        Employee.employee_id == employee.employee_id
    ).first()

    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="Employee ID already exists"
        )

    new_employee = Employee(
        employee_id=employee.employee_id,
        full_name=employee.full_name,
        email=employee.email,
        phone=employee.phone,
        department=employee.department,
        position=employee.position,
        salary=employee.salary,
        joining_date=employee.joining_date
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    create_audit_log(
    db=db,
    username=current_user.email,
    module="Employee",
    action=f"Created employee {employee.full_name}"
)

    return new_employee

@router.get(
    "/",
    summary="Get Employees",
    description="Returns a list of all employees."
)
def get_employees(
    search: str | None = Query(default=None),
    department: str | None = Query(default=None),
    status: str | None = Query(default=None),
    sort_by: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    query = db.query(Employee)

    if search:
        query = query.filter(
            or_(
                Employee.full_name.ilike(f"%{search}%"),
                Employee.employee_id.ilike(f"%{search}%")
            )
        )

    if department:
        query = query.filter(
            Employee.department == department
        )

    if status:
        query = query.filter(
            Employee.status == status
    )

    if sort_by == "full_name":
        query = query.order_by(Employee.full_name)

    elif sort_by == "salary":
        query = query.order_by(Employee.salary)

    elif sort_by == "joining_date":
        query = query.order_by(Employee.joining_date)

    total = query.count()

    total_pages = (total + limit - 1) // limit

    skip = (page - 1) * limit

    employees = query.offset(skip).limit(limit).all()

    return employees

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return employee

@router.put(
    "/{employee_id}",
    summary="Update Employee",
    description="Updates an existing employee using the employee ID."
)
def update_employee(
    employee_id: int,
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR"))
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    employee.employee_id = employee_data.employee_id
    employee.full_name = employee_data.full_name
    employee.email = employee_data.email
    employee.phone = employee_data.phone
    employee.department = employee_data.department
    employee.position = employee_data.position
    employee.salary = employee_data.salary
    employee.joining_date = employee_data.joining_date

    db.commit()
    db.refresh(employee)

    return employee

@router.delete(
    "/{employee_id}",
    summary="Delete Employee",
    description="Deletes an employee from the database."
)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin"))
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    db.delete(employee)
    db.commit()

    return {
        "message": "Employee deleted successfully"
    }