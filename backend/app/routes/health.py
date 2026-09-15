from fastapi import APIRouter
from sqlalchemy import text

from app.database.connection import SessionLocal


router = APIRouter(
    tags=["Health"],
)


@router.get("/health")
def health_check():
    db = SessionLocal()

    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0",
        }

    except Exception:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "version": "1.0.0",
        }

    finally:
        db.close()