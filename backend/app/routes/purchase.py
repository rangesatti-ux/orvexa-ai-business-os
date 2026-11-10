from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role
from app.models.product import Product
from app.models.purchase import Purchase, PurchaseItem
from app.models.supplier import Supplier
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.purchase import (
    PurchaseCreate,
    PurchaseResponse,
    PurchaseListResponse,
)

router = APIRouter(
    prefix="/purchases",
    tags=["Purchases"]
)


def generate_purchase_number(db: Session) -> str:
    today = datetime.now().strftime("%Y%m%d")

    count = (
        db.query(Purchase)
        .filter(
            Purchase.purchase_number.like(
                f"PO-{today}-%"
            )
        )
        .count()
    ) + 1

    return f"PO-{today}-{count:03d}"


# ===========================
# Create Purchase
# ===========================

@router.post(
    "/",
    response_model=PurchaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Purchase Order",
)
async def create_purchase(
    request: Request,
    purchase: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == purchase.supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found.",
        )

    try:
        subtotal = 0.0

        purchase_obj = Purchase(
            purchase_number=generate_purchase_number(db),
            supplier_id=purchase.supplier_id,
            gst=purchase.gst or 0.0,
            discount=purchase.discount or 0.0,
            status="Received",
            payment_status="Paid",
        )

        db.add(purchase_obj)
        db.flush()

        for item in purchase.items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .first()
            )

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} not found.",
                )

            item_total = round(item.quantity * item.price, 2)
            subtotal += item_total

            # Update inventory stock
            product.quantity += item.quantity

            purchase_item = PurchaseItem(
                purchase_id=purchase_obj.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
                total=item_total,
            )

            db.add(purchase_item)

        gst_amount = round(subtotal * (purchase.gst or 0.0) / 100.0, 2)
        grand_total = round(subtotal + gst_amount - (purchase.discount or 0.0), 2)

        purchase_obj.subtotal = round(subtotal, 2)
        purchase_obj.grand_total = max(grand_total, 0.0)

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Created purchase order {purchase_obj.purchase_number} from supplier {supplier.supplier_name}",
            module="Purchases",
            target_id=str(purchase_obj.id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)

        db.commit()
        db.refresh(purchase_obj)

        return purchase_obj

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


# ===========================
# Get Purchases
# ===========================

@router.get(
    "/",
    response_model=PurchaseListResponse,
    summary="Get Purchase Orders",
)
async def get_purchases(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Purchase)

    total = query.count()
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    purchases = (
        query
        .order_by(Purchase.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "purchases": purchases,
    }


# ===========================
# Purchase Dashboard
# ===========================

@router.get(
    "/dashboard/stats",
    summary="Purchase Dashboard Statistics",
)
async def purchase_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()
    if role not in {"admin", "hr"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dashboard access requires Admin or HR role.",
        )

    purchases = db.query(Purchase).all()
    total_amount = sum((purchase.grand_total or 0.0) for purchase in purchases)

    return {
        "total_purchases": len(purchases),
        "total_purchase_amount": round(total_amount, 2),
    }


# ===========================
# Get Purchase By ID
# ===========================

@router.get(
    "/{purchase_id}",
    response_model=PurchaseResponse,
    summary="Get Single Purchase Order",
)
async def get_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    purchase = (
        db.query(Purchase)
        .filter(Purchase.id == purchase_id)
        .first()
    )

    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase record not found.",
        )

    return purchase


# ===========================
# Delete Purchase
# ===========================

@router.delete(
    "/{purchase_id}",
    response_model=dict,
    summary="Delete Purchase Order (Admin Only)",
)
async def delete_purchase(
    request: Request,
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    purchase = (
        db.query(Purchase)
        .filter(Purchase.id == purchase_id)
        .first()
    )

    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase record not found.",
        )

    try:
        for item in purchase.items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .first()
            )

            if product:
                product.quantity = max(product.quantity - item.quantity, 0)

        po_number = purchase.purchase_number
        db.delete(purchase)

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Deleted purchase order #{purchase_id} ({po_number})",
            module="Purchases",
            target_id=str(purchase_id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)

        db.commit()

        return {
            "message": "Purchase order deleted successfully and inventory adjusted."
        }

    except Exception:
        db.rollback()
        raise