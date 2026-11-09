
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.config import settings
from app.core.rate_limit import limiter
from app.database.connection import Base, engine

# Import models
from app.models.user import User
from app.models.employee import Employee
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.customer import Customer
from app.models.supplier import Supplier
from app.models.purchase import Purchase, PurchaseItem
from app.models.attendance import Attendance
from app.models.leave import Leave
from app.models.payroll import Payroll
from app.models.department import Department
from app.models.task import Task

# Import routers
from app.routes import (
    auth,
    employee,
    product,
    sale,
    customer,
    supplier,
    purchase,
    attendance,
    leave,
    payroll,
    reports,
    analytics,
    department,
    task,
    notification,
    audit,
    ai,
)

# Import exception handlers
from app.exceptions.handlers import register_exception_handlers


# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Orvexa AI Business OS...")
    yield
    print("Shutting down Orvexa AI Business OS...")


# Initialize FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Orvexa AI Business OS API",
    lifespan=lifespan,
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS
    + ["https://orvexa-ai-business-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Rate limiter
app.state.limiter = limiter


# Register exception handlers
register_exception_handlers(app)


# Register routers
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


# Prometheus monitoring
Instrumentator().instrument(app).expose(app)


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Welcome to Orvexa AI Business OS API",
        "status": "running",
        "version": settings.APP_VERSION,
    }


# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "configured",
    }
