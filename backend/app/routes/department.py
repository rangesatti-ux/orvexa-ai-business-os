
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role
from app.models.department import Department
from app.models.user import User
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
)
from app.services.audit_service import create_audit_log


router = APIRouter(
    prefix="/departments",
    tags=["Departments"],
)


def normalize_department_code(code: str) -> str:
    return code.strip().upper()


def get_department_or_404(
    department_id: int,
    db: Session,
) -> Department:
    department = (
        db.query(Department)
        .filter(Department.id == department_id)
        .first()
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found.",
        )

    return department


# CREATE DEPARTMENT
# Admin / HR only
@router.post(
    "/",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    department_code = normalize_department_code(
        department.department_code
    )

    existing_code = (
        db.query(Department)
        .filter(
            func.upper(Department.department_code) == department_code
        )
        .first()
    )

    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Department code already exists.",
        )

    new_department = Department(
        department_code=department_code,
        department_name=department.department_name.strip(),
        description=department.description,
        manager_name=department.manager_name,
        status=department.status,
    )

    try:
        db.add(new_department)
        db.flush()

        create_audit_log(
            db=db,
            username=current_user.email,
            module="Department",
            action=f"Created department {department_code}",
        )

        db.commit()
        db.refresh(new_department)

        return new_department

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Department code already exists.",
        )

    except Exception:
        db.rollback()
        raise


# GET ALL DEPARTMENTS
# All authenticated users
@router.get(
    "/",
    response_model=list[DepartmentResponse],
)
def get_departments(
    search: str | None = Query(default=None, max_length=150),
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Department)

    if search:
        search_pattern = f"%{search.strip()}%"

        query = query.filter(
            (Department.department_code.ilike(search_pattern))
            | (Department.department_name.ilike(search_pattern))
            | (Department.manager_name.ilike(search_pattern))
        )

    if status_filter:
        if status_filter not in {"Active", "Inactive"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid department status.",
            )

        query = query.filter(
            Department.status == status_filter
        )

    return (
        query
        .order_by(Department.department_name.asc())
        .limit(500)
        .all()
    )


# GET SINGLE DEPARTMENT
# All authenticated users
@router.get(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_department_or_404(department_id, db)


# UPDATE DEPARTMENT
# Admin / HR only
@router.put(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def update_department(
    department_id: int,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    department = get_department_or_404(department_id, db)

    update_data = department_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update.",
        )

    if "department_code" in update_data:
        department_code = normalize_department_code(
            update_data["department_code"]
        )

        existing_code = (
            db.query(Department)
            .filter(
                func.upper(Department.department_code) == department_code,
                Department.id != department_id,
            )
            .first()
        )

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Department code already exists.",
            )

        update_data["department_code"] = department_code

    if "department_name" in update_data:
        update_data["department_name"] = (
            update_data["department_name"].strip()
        )

    if "manager_name" in update_data and update_data["manager_name"]:
        update_data["manager_name"] = (
            update_data["manager_name"].strip()
        )

    try:
        for field, value in update_data.items():
            setattr(department, field, value)

        create_audit_log(
            db=db,
            username=current_user.email,
            module="Department",
            action=f"Updated department #{department.id}",
        )

        db.commit()
        db.refresh(department)

        return department

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Department update conflicts with existing data.",
        )

    except Exception:
        db.rollback()
        raise


# DEACTIVATE DEPARTMENT
# Admin only
# Preserves department history and employee references
@router.delete(
    "/{department_id}",
)
def deactivate_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    department = get_department_or_404(department_id, db)

    if department.status == "Inactive":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Department is already inactive.",
        )

    try:
        department.status = "Inactive"

        create_audit_log(
            db=db,
            username=current_user.email,
            module="Department",
            action=f"Deactivated department #{department.id}",
        )

        db.commit()

        return {
            "message": "Department deactivated successfully.",
            "id": department_id,
            "status": "Inactive",
        }

    except Exception:
        db.rollback()
        raise
