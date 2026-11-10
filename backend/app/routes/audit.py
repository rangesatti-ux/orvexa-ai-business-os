from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.role import require_role
from app.models.audit_log import AuditLog

router = APIRouter(
    prefix="/audit",
    tags=["Audit Logs"],
)


@router.get(
    "/",
    dependencies=[Depends(require_role("Admin"))],
    summary="Retrieve System Audit Logs",
)
def get_logs(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    module: Optional[str] = Query(default=None),
    action: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)

    if module:
        query = query.filter(AuditLog.module.ilike(f"%{module}%"))

    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))

    return (
        query.order_by(AuditLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )