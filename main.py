from fastapi import FastAPI

from app.database.connection import Base, engine
from app.routes.auth import router as auth_router
from app.routes.employee import router as employee_router
from app.routes.product import router as product_router
from app.routes.sale import router as sale_router
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.customer import Customer
from app.routes.customer import router as customer_router
from app.models.supplier import Supplier
from app.routes.supplier import router as supplier_router
from app.models.purchase import Purchase, PurchaseItem
from app.routes.purchase import router as purchase_router
from app.models.attendance import Attendance
from app.routes.attendance import router as attendance_router
from app.models.leave import Leave
from app.routes.leave import router as leave_router
from app.models.payroll import Payroll
from app.routes.payroll import router as payroll_router
from app.routes.reports import router as reports_router
from app.routes.analytics import router as analytics_router
from app.routes.audit import router as audit_router
from app.routes.notification import router as notification_router
from app.routes.health import router as health_router
from app.exceptions.handlers import register_exception_handlers
from app.core.logging_config import logger
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.rate_limit import limiter
from app.exceptions.rate_limit import rate_limit_handler
from prometheus_fastapi_instrumentator import Instrumentator
from app.core.lifespan import lifespan
from app.routes import dashboard

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    Orvexa AI Business OS is a comprehensive business management system that integrates various functionalities to streamline operations. It includes modules for:
    - Attendance
    - Leave Management
    - Payroll
    - Reports
    - Analytics
    - AI Insights
    - Notifications
    - Audit Logs
""",
    lifespan=lifespan,
    contact={
        "name": "Naga Gopi Rangisetti",
        "email": "your-email@example.com"
    },
    license_info={
        "name": "MIT"
    }
)
app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(product_router)
app.include_router(sale_router)
app.include_router(customer_router)
app.include_router(supplier_router)
app.include_router(purchase_router)
app.include_router(attendance_router)
app.include_router(leave_router)
app.include_router(payroll_router)
app.include_router(reports_router)
app.include_router(analytics_router)
app.include_router(audit_router)
app.include_router(notification_router)
app.include_router(health_router)
register_exception_handlers(app)
logger.info("Orvexa AI Business OS started successfully.")
app.add_middleware(RequestIDMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(
    RateLimitExceeded,
    rate_limit_handler,
)
Instrumentator().instrument(app).expose(app)
app.include_router(dashboard.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Orvexa AI Business OS 🚀"
    }