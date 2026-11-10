from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.database.base import Base

# Explicitly import all SQLAlchemy models so Base.metadata is fully populated
from app.models.user import User  # noqa: F401
from app.models.department import Department  # noqa: F401
from app.models.task import Task  # noqa: F401
from app.models.employee import Employee  # noqa: F401
from app.models.product import Product  # noqa: F401
from app.models.customer import Customer  # noqa: F401
from app.models.supplier import Supplier  # noqa: F401
from app.models.sale import Sale  # noqa: F401
from app.models.sale_item import SaleItem  # noqa: F401
from app.models.purchase import Purchase  # noqa: F401
from app.models.attendance import Attendance  # noqa: F401
from app.models.leave import Leave  # noqa: F401
from app.models.payroll import Payroll  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.notification import Notification  # noqa: F401

# Engine Configuration based on DB type
engine_kwargs = {
    "pool_pre_ping": True,
}

if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_recycle": 1800,
    })

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()