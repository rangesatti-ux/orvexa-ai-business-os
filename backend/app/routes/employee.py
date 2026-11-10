from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import Optional

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.employee import Employee
from app.models.user import User
from app.models.department import Department
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
)
from app.services.audit_service import create_audit_log
from app.utils.security import hash_password
from app.dependencies.role import require_role

router = APIRouter(
    prefix="/employees",
    tags=["Employees"],
)


def normalize_email(email: str) -> str:
    return str(email).strip().lower()


def get_active_department(
    db: Session,
    department_id: int,
) -> Department:
    department = (
        db.query(Department)
        .filter(
            Department.id == department_id,
            Department.status == "Active",
        )
        .first()
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department not found or inactive.",
        )

    return department


def get_eligible_manager(
    db: Session,
    manager_id: int,
) -> Employee:
    manager = (
        db.query(Employee)
        .filter(Employee.id == manager_id)
        .first()
    )

    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Selected manager employee profile was not found.",
        )

    if manager.status != "Active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An inactive employee cannot be assigned as a manager.",
        )

    if not manager.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected manager does not have a linked user account.",
        )

    if not manager.user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected manager's user account is inactive.",
        )

    if str(manager.user.role or "").strip().casefold() != "manager":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The selected employee must have the Manager role.",
        )

    return manager


def validate_manager_assignment(
    db: Session,
    employee_id: int,
    manager_id: int,
) -> Employee:
    if employee_id == manager_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An employee cannot be their own manager.",
        )

    manager = get_eligible_manager(db, manager_id)

    visited = set()
    current_manager = manager

    while current_manager is not None:
        if current_manager.id == employee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This manager assignment would create a reporting cycle.",
            )

        if current_manager.id in visited:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The existing reporting hierarchy contains a cycle.",
            )

        visited.add(current_manager.id)

        if current_manager.manager_id is None:
            break

        current_manager = (
            db.query(Employee)
            .filter(Employee.id == current_manager.manager_id)
            .first()
        )

    return manager


# --------------------------------------------------
# CREATE EMPLOYEE + LOGIN ACCOUNT
# --------------------------------------------------

@router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Employee and Login Account",
)
async def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    normalized_email = normalize_email(employee.email)
    normalized_employee_id = employee.employee_id.strip()
    normalized_name = employee.full_name.strip()

    if not normalized_employee_id or not normalized_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID and Name cannot be empty.",
        )

    existing_employee = (
        db.query(Employee)
        .filter(
            or_(
                Employee.employee_id == normalized_employee_id,
                Employee.email == normalized_email,
            )
        )
        .first()
    )

    existing_user = (
        db.query(User)
        .filter(User.email == normalized_email)
        .first()
    )

    if existing_employee or existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee ID or email already exists.",
        )

    department = None
    if employee.department_id is not None:
        department = get_active_department(db, employee.department_id)

    manager = None
    if employee.manager_id is not None:
        manager = get_eligible_manager(db, employee.manager_id)

    try:
        new_user = User(
            full_name=normalized_name,
            email=normalized_email,
            password=hash_password(employee.password),
            role=employee.role,
            is_active=True,
        )

        db.add(new_user)
        db.flush()

        new_employee = Employee(
            user_id=new_user.id,
            employee_id=normalized_employee_id,
            full_name=normalized_name,
            email=normalized_email,
            phone=employee.phone,
            department_id=department.id if department else None,
            manager_id=manager.id if manager else None,
            department=(
                department.department_name
                if department
                else (employee.department.strip() if employee.department else None)
            ),
            position=employee.position,
            salary=employee.salary,
            joining_date=employee.joining_date,
            status="Active",
        )

        db.add(new_employee)
        db.flush()

        create_audit_log(
            db=db,
            username=current_user.email,
            module="Employee",
            action=f"Created employee {new_employee.full_name}" + (f" with manager {manager.full_name}" if manager else ""),
        )

        db.commit()
        db.refresh(new_employee)
        return new_employee

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee ID or email already exists.",
        )
    except Exception:
        db.rollback()
        raise


# --------------------------------------------------
# GET EMPLOYEE LIST
# --------------------------------------------------

@router.get(
    "/",
    response_model=EmployeeListResponse,
    summary="Get Employees",
)
async def get_employees(
    search: str | None = Query(default=None),
    department: str | None = Query(default=None),
    department_id: int | None = Query(default=None, gt=0),
    status_filter: str | None = Query(default=None, alias="status"),
    sort_by: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()
    query = db.query(Employee)

    if role not in {"admin", "hr"}:
        query = query.filter(Employee.user_id == current_user.id)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Employee.full_name.ilike(search_term),
                Employee.employee_id.ilike(search_term),
                Employee.email.ilike(search_term),
            )
        )

    if department_id is not None:
        query = query.filter(Employee.department_id == department_id)
    elif department:
        query = query.filter(Employee.department.ilike(f"%{department.strip()}%"))

    if status_filter:
        if status_filter.capitalize() not in {"Active", "Inactive"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid employee status filter.",
            )
        query = query.filter(Employee.status == status_filter.capitalize())

    if sort_by == "full_name":
        query = query.order_by(Employee.full_name)
    elif sort_by == "salary":
        if role not in {"admin", "hr"}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot sort by salary.",
            )
        query = query.order_by(Employee.salary)
    elif sort_by == "joining_date":
        query = query.order_by(Employee.joining_date)

    total = query.count()
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    skip = (page - 1) * limit

    employees = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "employees": employees,
    }


# --------------------------------------------------
# GET SINGLE EMPLOYEE
# --------------------------------------------------

@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
    summary="Get Single Employee",
)
async def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    role = str(current_user.role or "").strip().casefold()
    if role not in {"admin", "hr"} and employee.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access this employee profile.",
        )

    return employee


# --------------------------------------------------
# UPDATE EMPLOYEE
# --------------------------------------------------

@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse,
    summary="Update Employee",
)
async def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    update_data = employee_data.model_dump(exclude_unset=True)

    if "full_name" in update_data:
        if not update_data["full_name"] or not update_data["full_name"].strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee name cannot be empty.",
            )
        update_data["full_name"] = update_data["full_name"].strip()

    if "email" in update_data:
        if not update_data["email"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee email cannot be empty.",
            )
        normalized_email = normalize_email(update_data["email"])

        duplicate_employee = (
            db.query(Employee)
            .filter(Employee.email == normalized_email, Employee.id != employee_id)
            .first()
        )
        duplicate_user = (
            db.query(User)
            .filter(User.email == normalized_email, User.id != employee.user_id)
            .first()
        )

        if duplicate_employee or duplicate_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists.",
            )
        update_data["email"] = normalized_email

    if "department_id" in update_data:
        department_id = update_data["department_id"]
        if department_id is None:
            update_data["department"] = None
        else:
            department = get_active_department(db, department_id)
            update_data["department"] = department.department_name

    old_manager_id = employee.manager_id
    manager_changed = "manager_id" in update_data

    if manager_changed and update_data["manager_id"] is not None:
        validate_manager_assignment(db=db, employee_id=employee.id, manager_id=update_data["manager_id"])

    if "status" in update_data:
        if update_data["status"] not in {"Active", "Inactive"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid employee status.",
            )

    try:
        for key, value in update_data.items():
            setattr(employee, key, value)

        if employee.user:
            if "full_name" in update_data:
                employee.user.full_name = update_data["full_name"]
            if "email" in update_data:
                employee.user.email = update_data["email"]
            if "status" in update_data:
                employee.user.is_active = (update_data["status"] == "Active")

        audit_action = f"Updated employee {employee.full_name}"
        create_audit_log(
            db=db,
            username=current_user.email,
            module="Employee",
            action=audit_action,
        )

        db.commit()
        db.refresh(employee)
        return employee

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee email already exists or conflicts with another account.",
        )
    except Exception:
        db.rollback()
        raise


# --------------------------------------------------
# CONTROLLED MANAGER REASSIGNMENT
# --------------------------------------------------

@router.patch(
    "/{employee_id}/reassign-manager",
    response_model=EmployeeResponse,
    summary="Reassign Employee Manager",
)
async def reassign_manager(
    employee_id: int,
    manager_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    if manager_id is not None:
        validate_manager_assignment(db=db, employee_id=employee.id, manager_id=manager_id)

    old_manager_id = employee.manager_id
    employee.manager_id = manager_id

    create_audit_log(
        db=db,
        username=current_user.email,
        module="Employee",
        action=f"Reassigned manager for {employee.full_name} from {old_manager_id} to {manager_id}",
    )

    db.commit()
    db.refresh(employee)
    return employee


# --------------------------------------------------
# DEACTIVATE EMPLOYEE
# --------------------------------------------------

@router.delete(
    "/{employee_id}",
    response_model=dict,
    summary="Deactivate Employee",
)
async def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    if employee.status == "Inactive":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee is already inactive.",
        )

    try:
        employee.status = "Inactive"
        if employee.user:
            employee.user.is_active = False

        create_audit_log(
            db=db,
            username=current_user.email,
            module="Employee",
            action=f"Deactivated employee {employee.full_name}",
        )

        db.commit()
        return {
            "message": "Employee deactivated successfully.",
            "employee_id": employee.employee_id,
        }

    except Exception:
        db.rollback()
        raise