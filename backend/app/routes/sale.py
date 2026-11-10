from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role
from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.sale import SaleCreate, SaleListResponse, SaleResponse

router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)


def generate_invoice_number(db: Session) -> str:
    today = datetime.now().strftime("%Y%m%d")
    count = db.query(Sale).count() + 1
    return f"INV-{today}-{count:03d}"


# ===========================
# Create Sale (Checkout)
# ===========================

@router.post(
    "/",
    response_model=SaleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Sale Transaction",
)
async def create_sale(
    request: Request,
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    try:
        subtotal = 0.0

        invoice = Sale(
            invoice_number=generate_invoice_number(db),
            customer_name=sale.customer_name.strip(),
            customer_phone=sale.customer_phone,
            customer_email=sale.customer_email,
            payment_method=sale.payment_method or "Cash",
            payment_status="Paid",
            subtotal=0.0,
            gst=0.0,
            discount=sale.discount or 0.0,
            grand_total=0.0,
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
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product ID {item.product_id} not found.",
                )

            if product.quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for {product.product_name}. Available: {product.quantity}, Requested: {item.quantity}",
                )

            line_total = round(product.price * item.quantity, 2)
            subtotal += line_total

            sale_item = SaleItem(
                sale_id=invoice.id,
                product_id=product.id,
                quantity=item.quantity,
                price=product.price,
                total=line_total,
            )

            db.add(sale_item)
            product.quantity -= item.quantity

        invoice.subtotal = round(subtotal, 2)
        gst_amount = round(subtotal * (sale.gst or 0.0) / 100.0, 2)
        invoice.gst = gst_amount
        invoice.discount = round(sale.discount or 0.0, 2)
        invoice.grand_total = max(round(subtotal + gst_amount - invoice.discount, 2), 0.0)

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Created invoice {invoice.invoice_number} for customer {invoice.customer_name} (Total: ₹{invoice.grand_total})",
            module="Sales",
            target_id=str(invoice.id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)

        db.commit()
        db.refresh(invoice)

        # Reload with items relationship
        invoice_obj = (
            db.query(Sale)
            .options(joinedload(Sale.items))
            .filter(Sale.id == invoice.id)
            .first()
        )

        return invoice_obj

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
    response_model=SaleListResponse,
    summary="Get Sales Invoices",
)
async def get_sales(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Sale).options(
        joinedload(Sale.items)
    )

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Sale.invoice_number.ilike(search_term),
                Sale.customer_name.ilike(search_term),
                Sale.customer_phone.ilike(search_term),
                Sale.customer_email.ilike(search_term),
            )
        )

    query = query.order_by(Sale.created_at.desc())

    total = query.count()
    total_pages = (total + limit - 1) // limit if total > 0 else 1
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
        "sales": sales,
    }


# ===========================
# Sales Dashboard
# ===========================

@router.get(
    "/dashboard/stats",
    summary="Sales Dashboard Statistics",
)
async def sales_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()
    if role not in {"admin", "hr"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dashboard access requires Admin or HR role.",
        )

    total_sales = db.query(Sale).count()

    total_revenue = (
        db.query(func.coalesce(func.sum(Sale.grand_total), 0.0))
        .scalar()
    )

    today = datetime.now().date()

    today_sales = (
        db.query(func.coalesce(func.sum(Sale.grand_total), 0.0))
        .filter(
            func.date(Sale.created_at) == today
        )
        .scalar()
    )

    return {
        "total_sales": total_sales,
        "total_revenue": round(total_revenue, 2),
        "today_revenue": round(today_sales, 2),
    }


# ===========================
# Get Sale By ID
# ===========================

@router.get(
    "/{sale_id}",
    response_model=SaleResponse,
    summary="Get Single Sale Invoice",
)
async def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sale = (
        db.query(Sale)
        .options(joinedload(Sale.items))
        .filter(Sale.id == sale_id)
        .first()
    )

    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale record not found.",
        )

    return sale


# ===========================
# Delete Sale
# ===========================

@router.delete(
    "/{sale_id}",
    response_model=dict,
    summary="Delete Sale Order (Admin Only)",
)
async def delete_sale(
    request: Request,
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    sale = (
        db.query(Sale)
        .options(joinedload(Sale.items))
        .filter(Sale.id == sale_id)
        .first()
    )

    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale record not found.",
        )

    try:
        for item in sale.items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .first()
            )

            if product:
                product.quantity += item.quantity

        inv_number = sale.invoice_number
        db.delete(sale)

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Deleted sale invoice #{sale_id} ({inv_number}) and restored inventory",
            module="Sales",
            target_id=str(sale_id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)

        db.commit()

        return {
            "message": "Sale deleted successfully and inventory restored."
        }

    except Exception:
        db.rollback()
        raise