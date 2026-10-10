from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.department import Department
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
)

router = APIRouter(
    prefix="/departments",
    tags=["Departments"],
)


@router.post(
    "/",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
):
    existing_code = (
        db.query(Department)
        .filter(
            Department.department_code == department.department_code
        )
        .first()
    )

    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department code already exists.",
        )

    new_department = Department(
        department_code=department.department_code,
        department_name=department.department_name,
        description=department.description,
        manager_name=department.manager_name,
        status=department.status,
    )

    db.add(new_department)
    db.commit()
    db.refresh(new_department)

    return new_department


@router.get(
    "/",
    response_model=list[DepartmentResponse],
)
def get_departments(
    search: str | None = Query(default=None),
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Department)

    if search:
        search_pattern = f"%{search}%"

        query = query.filter(
            (Department.department_code.ilike(search_pattern))
            | (Department.department_name.ilike(search_pattern))
            | (Department.manager_name.ilike(search_pattern))
        )

    if status_filter:
        query = query.filter(
            Department.status == status_filter
        )

    return (
        query
        .order_by(Department.id.desc())
        .all()
    )


@router.get(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
):
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


@router.put(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def update_department(
    department_id: int,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
):
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

    update_data = department_data.model_dump(
        exclude_unset=True
    )

    if "department_code" in update_data:
        existing_code = (
            db.query(Department)
            .filter(
                Department.department_code
                == update_data["department_code"],
                Department.id != department_id,
            )
            .first()
        )

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department code already exists.",
            )

    for field, value in update_data.items():
        setattr(department, field, value)

    db.commit()
    db.refresh(department)

    return department


@router.delete(
    "/{department_id}",
)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
):
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

    db.delete(department)
    db.commit()

    return {
        "message": "Department deleted successfully.",
        "id": department_id,
    }