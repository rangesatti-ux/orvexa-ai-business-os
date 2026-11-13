from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import text

from app.core.config import settings
from app.core.rate_limit import limiter
from app.database.connection import engine

# Import SQLAlchemy models to ensure metadata registration
from app.models.user import User  # noqa: F401
from app.models.employee import Employee  # noqa: F401
from app.models.sale import Sale  # noqa: F401
from app.models.sale_item import SaleItem  # noqa: F401
from app.models.customer import Customer  # noqa: F401
from app.models.supplier import Supplier  # noqa: F401
from app.models.purchase import Purchase  # noqa: F401
from app.models.attendance import Attendance  # noqa: F401
from app.models.leave import Leave  # noqa: F401
from app.models.payroll import Payroll  # noqa: F401
from app.models.department import Department  # noqa: F401
from app.models.task import Task  # noqa: F401

# Import routers
from app.routes import (
    ai,
    analytics,
    attendance,
    audit,
    auth,
    customer,
    dashboard,
    department,
    employee,
    leave,
    notification,
    payroll,
    product,
    purchase,
    reports,
    sale,
    supplier,
    task,
)

# Import exception handlers
from app.exceptions.handlers import register_exception_handlers

logger = logging.getLogger("orvexa")


# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Orvexa AI Business OS API...")
    yield
    logger.info("Shutting down Orvexa AI Business OS API...")


# Initialize FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Orvexa AI Business OS Backend API Platform",
    lifespan=lifespan,
)


# Normalize CORS origins including your live Vercel frontend
configured_origins = list(settings.BACKEND_CORS_ORIGINS) if hasattr(settings, "BACKEND_CORS_ORIGINS") else []
additional_origins = [
    "https://orvexa-ai-business-os.vercel.app",
    "https://orvexa-ai-business-frontend.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000",
]
all_origins = set([str(o).rstrip("/") for o in configured_origins + additional_origins if o])

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(all_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiter
app.state.limiter = limiter

# Register global exception handlers
register_exception_handlers(app)

# Include All APIRouters
app.include_router(auth.router)
app.include_router(employee.router)
app.include_router(product.router)
app.include_router(sale.router)
app.include_router(customer.router)
app.include_router(supplier.router)
app.include_router(purchase.router)
app.include_router(attendance.router)
app.include_router(leave.router)
app.include_router(payroll.router)
app.include_router(reports.router)
app.include_router(analytics.router)
app.include_router(department.router)
app.include_router(task.router)
app.include_router(notification.router)
app.include_router(audit.router)
app.include_router(ai.router)
app.include_router(dashboard.router)

# Prometheus Monitoring Metrics
Instrumentator().instrument(app).expose(app)


# Root Endpoint
@app.get("/")
def root():
    return {
        "message": "Welcome to Orvexa AI Business OS API",
        "status": "running",
        "version": settings.APP_VERSION,
    }


# Health Check Endpoint
@app.get("/health")
def health_check():
    db_status = "healthy"
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unreachable"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "version": settings.APP_VERSION,
    }
