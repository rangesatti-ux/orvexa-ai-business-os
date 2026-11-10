from sqlalchemy import Column, Integer, String, DateTime, Text, Index, ForeignKey
from sqlalchemy.sql import func

from app.database.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    __table_args__ = (
        Index("ix_audit_logs_module_action", "module", "action"),
        Index("ix_audit_logs_created_at", "created_at"),
    )

    id = Column(
        Integer, 
        primary_key=True, 
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    username = Column(
        String(100), 
        nullable=False,
        default="System",
        index=True,
    )

    role = Column(
        String(50),
        nullable=True,
    )

    action = Column(
        String(255), 
        nullable=False
    )

    module = Column(
        String(100), 
        nullable=False,
        index=True
    )

    target_id = Column(
        String(100),
        nullable=True,
        doc="Primary identifier of the affected entity (e.g. Employee ID, Sale ID)",
    )

    details = Column(
        Text,
        nullable=True,
        doc="JSON string or textual log payload containing changes or metadata context",
    )

    ip_address = Column(
        String(45),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )