from fastapi import APIRouter, Depends
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
)
def get_logs(
    db: Session = Depends(get_db),
):
    return (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .all()
    )