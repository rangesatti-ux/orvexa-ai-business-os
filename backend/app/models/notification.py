from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    __table_args__ = (
        Index("ix_notifications_user_unread", "user_id", "is_read"),
        Index("ix_notifications_created_at", "created_at"),
        Index("ix_notifications_module", "module"),
    )

    id = Column(
        Integer, 
        primary_key=True, 
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        doc="Target user for this notification. Null indicates system-wide broadcast.",
    )

    title = Column(
        String(200), 
        nullable=False
    )

    message = Column(
        String(500), 
        nullable=False
    )

    module = Column(
        String(100), 
        nullable=False,
        default="System",
    )

    type = Column(
        String(50),
        nullable=False,
        default="info",
        server_default=text("'info'"),
        doc="Type classification: info, warning, success, alert, leave, payroll",
    )

    link = Column(
        String(255),
        nullable=True,
        doc="Optional route path for click redirection (e.g. /leave or /payroll)",
    )

    is_read = Column(
        Boolean, 
        default=False,
        server_default=text("false"),
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship(
        "User",
        foreign_keys=[user_id],
    )