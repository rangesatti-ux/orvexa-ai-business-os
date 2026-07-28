from fastapi import FastAPI

from app.database.connection import Base, engine
from app.models.user import User
from app.models.employee import Employee
from app.routes.auth import router as auth_router
from app.models.product import Product
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
from app.routes import dashboard

app = FastAPI(
    title="Orvexa AI Business OS",
    version="1.0.0"
)
Base.metadata.create_all(bind=engine)
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
app.include_router(dashboard.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Orvexa AI Business OS 🚀"
    }