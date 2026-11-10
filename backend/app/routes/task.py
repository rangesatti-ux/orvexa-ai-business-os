from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role
from app.models.employee import Employee
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.audit_service import create_audit_log

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


def get_my_employee(
    db: Session,
    current_user: User,
) -> Optional[Employee]:
    return (
        db.query(Employee)
        .filter(Employee.user_id == current_user.id)
        .first()
    )


# CREATE TASK
@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Task",
)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR", "Manager")),
):
    create_dict = task_data.model_dump()

    if "assigned_to_id" in create_dict and create_dict["assigned_to_id"]:
        employee = (
            db.query(Employee)
            .filter(Employee.id == create_dict["assigned_to_id"])
            .first()
        )
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned employee profile not found.",
            )
        create_dict["employee"] = employee.full_name

    if not hasattr(Task, "assigned_to_id"):
        create_dict.pop("assigned_to_id", None)

    task = Task(**create_dict)

    try:
        db.add(task)
        db.flush()

        create_audit_log(
            db=db,
            username=current_user.email,
            module="Task",
            action=f"Created task '{task.title}'",
        )

        db.commit()
        db.refresh(task)
        return task

    except Exception:
        db.rollback()
        raise


# GET ALL TASKS
@router.get(
    "/",
    response_model=list[TaskResponse],
    summary="Get Tasks",
)
async def get_tasks(
    search: Optional[str] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    priority: Optional[str] = Query(default=None),
    assigned_to_id: Optional[int] = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()
    query = db.query(Task)

    if role not in {"admin", "hr", "manager"}:
        employee = get_my_employee(db, current_user)
        if employee:
            if hasattr(Task, "assigned_to_id"):
                query = query.filter(
                    (Task.assigned_to_id == employee.id)
                    | (Task.employee.ilike(f"%{employee.full_name}%"))
                )
            else:
                query = query.filter(Task.employee.ilike(f"%{employee.full_name}%"))
        else:
            return []
    elif assigned_to_id is not None and hasattr(Task, "assigned_to_id"):
        query = query.filter(Task.assigned_to_id == assigned_to_id)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            Task.title.ilike(pattern)
            | Task.employee.ilike(pattern)
            | Task.description.ilike(pattern)
        )

    if status_filter:
        query = query.filter(Task.status == status_filter)

    if priority:
        query = query.filter(Task.priority == priority)

    return query.order_by(Task.id.desc()).all()


# TASK DASHBOARD STATS
@router.get(
    "/dashboard/stats",
    summary="Get Task Statistics",
)
async def get_task_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()
    query = db.query(Task)

    if role not in {"admin", "hr", "manager"}:
        employee = get_my_employee(db, current_user)
        if employee:
            if hasattr(Task, "assigned_to_id"):
                query = query.filter(
                    (Task.assigned_to_id == employee.id)
                    | (Task.employee.ilike(f"%{employee.full_name}%"))
                )
            else:
                query = query.filter(Task.employee.ilike(f"%{employee.full_name}%"))
        else:
            return {
                "total_tasks": 0,
                "completed": 0,
                "in_progress": 0,
                "pending": 0,
            }

    tasks = query.all()

    return {
        "total_tasks": len(tasks),
        "completed": sum(1 for t in tasks if str(t.status).strip().casefold() == "completed"),
        "in_progress": sum(1 for t in tasks if str(t.status).strip().casefold() == "in progress"),
        "pending": sum(1 for t in tasks if str(t.status).strip().casefold() == "pending"),
    }


# GET SINGLE TASK
@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get Single Task",
)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )

    role = str(current_user.role or "").strip().casefold()

    if role not in {"admin", "hr", "manager"}:
        employee = get_my_employee(db, current_user)
        is_assigned = (
            employee
            and (
                (hasattr(task, "assigned_to_id") and task.assigned_to_id == employee.id)
                or (task.employee and employee.full_name.lower() in task.employee.lower())
            )
        )
        if not is_assigned:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot view this task.",
            )

    return task


# UPDATE TASK
@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update Task",
)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )

    role = str(current_user.role or "").strip().casefold()
    update_dict = task_data.model_dump(exclude_unset=True)

    if role not in {"admin", "hr", "manager"}:
        employee = get_my_employee(db, current_user)
        is_assigned = (
            employee
            and (
                (hasattr(task, "assigned_to_id") and task.assigned_to_id == employee.id)
                or (task.employee and employee.full_name.lower() in task.employee.lower())
            )
        )
        if not is_assigned:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot update this task.",
            )
        
        non_status_keys = [k for k in update_dict.keys() if k != "status"]
        if non_status_keys:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees can only update task status.",
            )

    if "assigned_to_id" in update_dict and update_dict["assigned_to_id"]:
        employee = (
            db.query(Employee)
            .filter(Employee.id == update_dict["assigned_to_id"])
            .first()
        )
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned employee profile not found.",
            )
        update_dict["employee"] = employee.full_name

    if not hasattr(Task, "assigned_to_id"):
        update_dict.pop("assigned_to_id", None)

    try:
        for field, value in update_dict.items():
            if hasattr(task, field):
                setattr(task, field, value)

        create_audit_log(
            db=db,
            username=current_user.email,
            module="Task",
            action=f"Updated task #{task.id}",
        )

        db.commit()
        db.refresh(task)
        return task

    except Exception:
        db.rollback()
        raise


# DELETE TASK
@router.delete(
    "/{task_id}",
    summary="Delete Task",
)
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR", "Manager")),
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )

    try:
        create_audit_log(
            db=db,
            username=current_user.email,
            module="Task",
            action=f"Deleted task #{task.id}",
        )

        db.delete(task)
        db.commit()

        return {
            "message": "Task deleted successfully.",
            "id": task_id,
        }

    except Exception:
        db.rollback()
        raise