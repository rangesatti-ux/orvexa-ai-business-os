from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session,
    title: str,
    message: str,
    module: str,
):
    notification = Notification(
        title=title,
        message=message,
        module=module,
    )

    db.add(notification)
    db.commit()