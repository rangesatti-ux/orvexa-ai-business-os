from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.database.connection import get_db
from app.dependencies.role import require_role
from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.schemas.sale import SaleCreate, SaleListResponse, SaleResponse


router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)


def generate_invoice_number(db: Session):
    today = datetime.now().strftime("%Y%m%d")
    count = db.query(Sale).count() + 1
    return f"INV-{today}-{count:03d}"


# ===========================
# Create Sale
# ===========================

@router.post(
    "/",
    response_model=SaleResponse,
    dependencies=[Depends(require_role("Admin", "HR"))]
)
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db)
):
    try:
        subtotal = 0

        invoice = Sale(
            invoice_number=generate_invoice_number(db),
            customer_name=sale.customer_name,
            customer_phone=sale.customer_phone,
            customer_email=sale.customer_email,
            payment_method=sale.payment_method,
            payment_status="Paid"
        )

        db.add(invoice)
        db.flush()

        for item in sale.items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .first()
            )

            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product {item.product_id} not found"
                )

            if product.quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product.product_name}"
                )

            line_total = product.price * item.quantity
            subtotal += line_total

            sale_item = SaleItem(
                sale_id=invoice.id,
                product_id=product.id,
                quantity=item.quantity,
                price=product.price,
                total=line_total
            )

            db.add(sale_item)

            product.quantity -= item.quantity

        invoice.subtotal = subtotal

        gst_amount = subtotal * (sale.gst / 100)

        invoice.gst = gst_amount
        invoice.discount = sale.discount

        invoice.grand_total = (
            subtotal +
            gst_amount -
            sale.discount
        )

        db.commit()
        db.refresh(invoice)

        invoice = (
            db.query(Sale)
            .options(joinedload(Sale.items))
            .filter(Sale.id == invoice.id)
            .first()
        )

        return invoice

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise


# ===========================
# Get Sales
# ===========================

@router.get(
    "/",
    response_model=SaleListResponse
)
def get_sales(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1),
    db: Session = Depends(get_db)
):
    query = db.query(Sale).options(
        joinedload(Sale.items)
    )

    if search:
        query = query.filter(
            or_(
                Sale.invoice_number.ilike(f"%{search}%"),
                Sale.customer_name.ilike(f"%{search}%"),
                Sale.customer_phone.ilike(f"%{search}%")
            )
        )

    query = query.order_by(Sale.created_at.desc())

    total = query.count()

    total_pages = (total + limit - 1) // limit

    skip = (page - 1) * limit

    sales = (
        query
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "sales": sales
    }


# ===========================
# Sales Dashboard
# ===========================

@router.get("/dashboard/stats")
def sales_dashboard(
    db: Session = Depends(get_db)
):
    total_sales = db.query(Sale).count()

    total_revenue = (
        db.query(func.sum(Sale.grand_total))
        .scalar()
        or 0
    )

    today = datetime.now().date()

    today_sales = (
        db.query(func.sum(Sale.grand_total))
        .filter(
            func.date(Sale.created_at) == today
        )
        .scalar()
        or 0
    )

    return {
        "total_sales": total_sales,
        "total_revenue": total_revenue,
        "today_revenue": today_sales
    }


# ===========================
# Get Sale By ID
# ===========================

@router.get(
    "/{sale_id}",
    response_model=SaleResponse
)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db)
):
    sale = (
        db.query(Sale)
        .options(joinedload(Sale.items))
        .filter(Sale.id == sale_id)
        .first()
    )

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale not found"
        )

    return sale


# ===========================
# Delete Sale
# ===========================

@router.delete(
    "/{sale_id}",
    dependencies=[Depends(require_role("Admin"))]
)
def delete_sale(
    sale_id: int,
    db: Session = Depends(get_db)
):
    sale = (
        db.query(Sale)
        .options(joinedload(Sale.items))
        .filter(Sale.id == sale_id)
        .first()
    )

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale not found"
        )

    for item in sale.items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        if product:
            product.quantity += item.quantity

    db.delete(sale)
    db.commit()

    return {
        "message": "Sale deleted successfully"
    }