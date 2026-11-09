
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    username: str,
    module: str,
    action: str,
) -> AuditLog:
    log = AuditLog(
        username=username,
        module=module,
        action=action,
    )

    db.add(log)
    return log
