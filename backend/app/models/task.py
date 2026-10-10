from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False, index=True)

    description = Column(Text, nullable=True)

    employee = Column(String(150), nullable=False, default="Unassigned")

    priority = Column(
        String(20),
        nullable=False,
        default="Medium",
    )

    due_date = Column(Date, nullable=True)

    status = Column(
        String(30),
        nullable=False,
        default="Pending",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )