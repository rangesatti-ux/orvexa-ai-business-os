from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.product import Product
from app.models.sale import Sale
from app.models.purchase import Purchase
from app.models.payroll import Payroll
from app.services.ai_service import generate_ai_insights

from app.database.connection import get_db

from app.models.employee import Employee
from app.models.customer import Customer
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.purchase import Purchase
from app.models.payroll import Payroll

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):

    total_employees = db.query(Employee).count()

    total_customers = db.query(Customer).count()

    total_suppliers = db.query(Supplier).count()

    total_products = db.query(Product).count()

    total_sales = db.query(Sale).count()

    total_purchases = db.query(Purchase).count()

    total_payroll = db.query(
        func.coalesce(func.sum(Payroll.net_salary), 0)
    ).scalar()

    total_revenue = db.query(
        func.coalesce(func.sum(Sale.grand_total), 0)
    ).scalar()

    total_purchase_amount = db.query(
        func.coalesce(func.sum(Purchase.grand_total), 0)
    ).scalar()

    low_stock = db.query(Product).filter(
        Product.quantity < 10
    ).count()

    profit = total_revenue - total_purchase_amount

    return {
        "employees": total_employees,
        "customers": total_customers,
        "suppliers": total_suppliers,
        "products": total_products,
        "sales": total_sales,
        "purchases": total_purchases,
        "revenue": total_revenue,
        "purchase_amount": total_purchase_amount,
        "payroll_expense": total_payroll,
        "estimated_profit": profit,
        "low_stock_products": low_stock
    }

@router.get("/low-stock")
def low_stock_products(
    db: Session = Depends(get_db)
):
    products = (
        db.query(Product)
        .filter(Product.quantity < 10)
        .all()
    )

    return [
        {
            "id": p.id,
            "product_name": p.product_name,
            "quantity": p.quantity,
            "category": p.category
        }
        for p in products
    ]

@router.get("/finance-summary")
def finance_summary(
    db: Session = Depends(get_db)
):
    revenue = db.query(
        func.coalesce(func.sum(Sale.grand_total), 0)
    ).scalar()

    purchases = db.query(
        func.coalesce(func.sum(Purchase.grand_total), 0)
    ).scalar()

    payroll = db.query(
        func.coalesce(func.sum(Payroll.net_salary), 0)
    ).scalar()

    return {
        "revenue": revenue,
        "purchase_expense": purchases,
        "payroll_expense": payroll,
        "estimated_profit": revenue - purchases - payroll
    }

@router.get("/top-products")
def top_products(
    limit: int = 10,
    db: Session = Depends(get_db)
):

    products = (
        db.query(
            Product.id,
            Product.product_name,
            func.sum(SaleItem.quantity).label("total_sold")
        )
        .join(SaleItem, Product.id == SaleItem.product_id)
        .group_by(
            Product.id,
            Product.product_name
        )
        .order_by(
            func.sum(SaleItem.quantity).desc()
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "product_id": p.id,
            "product_name": p.product_name,
            "total_sold": int(p.total_sold)
        }
        for p in products
    ]

@router.get("/ai-insights")
def ai_insights(
    db: Session = Depends(get_db)
):
    return {
        "insights": generate_ai_insights(db)
    }