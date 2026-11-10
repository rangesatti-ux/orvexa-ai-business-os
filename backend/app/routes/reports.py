from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role
from app.models.employee import Employee
from app.models.product import Product
from app.models.sale import Sale
from app.models.payroll import Payroll
from app.models.user import User
from app.services.pdf_service import generate_pdf
from app.services.excel_service import generate_excel
from app.services.audit_service import create_audit_log

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ===========================
# Employee PDF
# ===========================

@router.get(
    "/employees/pdf",
    summary="Download Employee PDF Report",
)
async def employee_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    employees = db.query(Employee).all()

    rows = [
        f"{e.id} | {e.full_name} | {e.department or 'N/A'} | {e.status}"
        for e in employees
    ]

    pdf = generate_pdf(
        "Employee Directory Report",
        rows,
    )

    create_audit_log(
        db=db,
        username=current_user.email,
        module="Reports",
        action="Downloaded Employee PDF report",
    )
    db.commit()

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=employees.pdf"
        }
    )


# ===========================
# Employee Excel
# ===========================

@router.get(
    "/employees/excel",
    summary="Download Employee Excel Report",
)
async def employee_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    employees = db.query(Employee).all()

    rows = [
        [
            e.id,
            e.employee_id,
            e.full_name,
            e.department or "",
            e.position or "",
            e.salary or 0.0,
            e.status,
        ]
        for e in employees
    ]

    excel = generate_excel(
        ["ID", "Employee ID", "Full Name", "Department", "Position", "Salary", "Status"],
        rows,
    )

    create_audit_log(
        db=db,
        username=current_user.email,
        module="Reports",
        action="Downloaded Employee Excel report",
    )
    db.commit()

    return StreamingResponse(
        excel,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition":
            "attachment; filename=employees.xlsx"
        }
    )


# ===========================
# Inventory PDF
# ===========================

@router.get(
    "/inventory/pdf",
    summary="Download Inventory PDF Report",
)
async def inventory_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    products = db.query(Product).all()

    rows = [
        f"{p.product_code} | {p.product_name} | Qty: {p.quantity} | ₹{p.price}"
        for p in products
    ]

    pdf = generate_pdf(
        "Inventory Stock Report",
        rows,
    )

    create_audit_log(
        db=db,
        username=current_user.email,
        module="Reports",
        action="Downloaded Inventory PDF report",
    )
    db.commit()

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=inventory.pdf"
        }
    )


# ===========================
# Sales PDF
# ===========================

@router.get(
    "/sales/pdf",
    summary="Download Sales PDF Report",
)
async def sales_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    sales = db.query(Sale).order_by(Sale.created_at.desc()).all()

    rows = [
        f"{s.invoice_number} | {s.customer_name} | ₹{s.grand_total} | {s.payment_status}"
        for s in sales
    ]

    pdf = generate_pdf(
        "Sales Transactions Report",
        rows,
    )

    create_audit_log(
        db=db,
        username=current_user.email,
        module="Reports",
        action="Downloaded Sales PDF report",
    )
    db.commit()

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=sales.pdf"
        }
    )


# ===========================
# Payroll PDF
# ===========================

@router.get(
    "/payroll/pdf",
    summary="Download Payroll PDF Report",
)
async def payroll_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    payrolls = db.query(Payroll).all()

    rows = [
        f"Employee #{p.employee_id} | Month: {p.month} | Net: ₹{p.net_salary}"
        for p in payrolls
    ]

    pdf = generate_pdf(
        "Payroll Disbursal Report",
        rows,
    )

    create_audit_log(
        db=db,
        username=current_user.email,
        module="Reports",
        action="Downloaded Payroll PDF report",
    )
    db.commit()

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=payroll.pdf"
        }
    )