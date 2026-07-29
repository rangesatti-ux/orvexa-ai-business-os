from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

from app.database.base import Base
from app.models.user import User
from app.models.employee import Employee
from app.models.product import Product
from app.models.customer import Customer
from app.models.supplier import Supplier
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.purchase import Purchase
from app.models.attendance import Attendance
from app.models.leave import Leave
from app.models.payroll import Payroll
from app.models.audit_log import AuditLog
from app.models.notification import Notification

import os

if not os.getenv("GITHUB_ACTIONS"):
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("DATABASE_URL =", DATABASE_URL)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
 #Base.metadata.create_all(bind=engine)