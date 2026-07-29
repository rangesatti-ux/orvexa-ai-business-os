from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.models.employee import Employee
from app.models.product import Product
from app.models.sale import Sale
from app.models.payroll import Payroll

from app.services.pdf_service import generate_pdf
from app.services.excel_service import generate_excel

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ===========================
# Employee PDF
# ===========================

@router.get("/employees/pdf")
def employee_pdf(
    db: Session = Depends(get_db)
):

    employees = db.query(Employee).all()

    rows = [
        f"{e.id} | {e.first_name} {e.last_name}"
        for e in employees
    ]

    pdf = generate_pdf(
        "Employee Report",
        rows
    )

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

@router.get("/employees/excel")
def employee_excel(
    db: Session = Depends(get_db)
):

    employees = db.query(Employee).all()

    rows = [
        [
            e.id,
            e.first_name,
            e.last_name
        ]
        for e in employees
    ]

    excel = generate_excel(
        ["ID", "First Name", "Last Name"],
        rows
    )

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

@router.get("/inventory/pdf")
def inventory_pdf(
    db: Session = Depends(get_db)
):

    products = db.query(Product).all()

    rows = [
        f"{p.product_name} | Qty:{p.quantity}"
        for p in products
    ]

    pdf = generate_pdf(
        "Inventory Report",
        rows
    )

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

@router.get("/sales/pdf")
def sales_pdf(
    db: Session = Depends(get_db)
):

    sales = db.query(Sale).all()

    rows = [
        f"{s.invoice_number} | ₹{s.grand_total}"
        for s in sales
    ]

    pdf = generate_pdf(
        "Sales Report",
        rows
    )

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

@router.get("/payroll/pdf")
def payroll_pdf(
    db: Session = Depends(get_db)
):

    payrolls = db.query(Payroll).all()

    rows = [
        f"{p.employee_id} | ₹{p.net_salary}"
        for p in payrolls
    ]

    pdf = generate_pdf(
        "Payroll Report",
        rows
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=payroll.pdf"
        }
    )