import logging
from typing import Optional
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)


def create_audit_log(
    db: Session,
    username: str,
    module: str,
    action: str,
    user_id: Optional[int] = None,
    role: Optional[str] = None,
    target_id: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Create and add an audit log entry to the current database session."""
    try:
        log = AuditLog(
            user_id=user_id,
            username=username,
            role=role,
            module=module,
            action=action,
            target_id=target_id,
            ip_address=ip_address,
        )

        db.add(log)
        db.flush()
        return log

    except Exception as exc:
        logger.exception(f"Failed to create audit log: {exc}")
        raise