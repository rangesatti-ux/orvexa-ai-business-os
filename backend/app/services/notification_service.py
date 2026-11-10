import logging
from typing import Optional
from sqlalchemy.orm import Session

from app.models.notification import Notification

logger = logging.getLogger(__name__)


def create_notification(
    db: Session,
    title: str,
    message: str,
    module: str,
    user_id: Optional[int] = None,
    role: Optional[str] = None,
) -> Notification:
    """Create and persist an application notification in the database."""
    try:
        notification = Notification(
            title=title,
            message=message,
            module=module,
            user_id=user_id,
            role=role,
        )

        db.add(notification)
        db.flush()
        db.commit()
        db.refresh(notification)

        return notification

    except Exception as exc:
        db.rollback()
        logger.exception(f"Failed to create notification: {exc}")
        raise