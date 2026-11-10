from fastapi import APIRouter, Response, status
from sqlalchemy import text

from app.database.connection import SessionLocal

router = APIRouter(
    tags=["Health"],
)


@router.get("/health", summary="System Health Check")
async def health_check(response: Response):
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0",
        }

    except Exception:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "version": "1.0.0",
        }