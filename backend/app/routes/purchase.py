from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.role import require_role
from app.models.product import Product
from app.models.purchase import Purchase, PurchaseItem
from app.models.supplier import Supplier
from app.schemas.purchase import (
    PurchaseCreate,
    PurchaseResponse,
    PurchaseListResponse,
)


router = APIRouter(
    prefix="/purchases",
    tags=["Purchases"]
)


def generate_purchase_number(db: Session):
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
    dependencies=[Depends(require_role("Admin", "HR"))],
)
def create_purchase(
    purchase: PurchaseCreate,
    db: Session = Depends(get_db),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == purchase.supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    try:
        subtotal = 0

        purchase_obj = Purchase(
            purchase_number=generate_purchase_number(db),
            supplier_id=purchase.supplier_id,
            gst=purchase.gst,
            discount=purchase.discount,
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
                    status_code=404,
                    detail=f"Product {item.product_id} not found"
                )

            total = item.quantity * item.price
            subtotal += total

            product.quantity += item.quantity

            purchase_item = PurchaseItem(
                purchase_id=purchase_obj.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
                total=total,
            )

            db.add(purchase_item)

        grand_total = (
            subtotal
            + (subtotal * purchase.gst / 100)
            - purchase.discount
        )

        purchase_obj.subtotal = subtotal
        purchase_obj.grand_total = grand_total

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
    response_model=PurchaseListResponse
)
def get_purchases(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
):
    query = db.query(Purchase)

    total = query.count()

    total_pages = (total + limit - 1) // limit

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

@router.get("/dashboard/stats")
def purchase_dashboard(
    db: Session = Depends(get_db),
):
    purchases = db.query(Purchase).all()

    total_amount = sum(
        purchase.grand_total
        for purchase in purchases
    )

    return {
        "total_purchases": len(purchases),
        "total_purchase_amount": total_amount,
    }


# ===========================
# Get Purchase By ID
# ===========================

@router.get(
    "/{purchase_id}",
    response_model=PurchaseResponse
)
def get_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
):
    purchase = (
        db.query(Purchase)
        .filter(Purchase.id == purchase_id)
        .first()
    )

    if not purchase:
        raise HTTPException(
            status_code=404,
            detail="Purchase not found"
        )

    return purchase


# ===========================
# Delete Purchase
# ===========================

@router.delete(
    "/{purchase_id}",
    dependencies=[Depends(require_role("Admin"))],
)
def delete_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
):
    purchase = (
        db.query(Purchase)
        .filter(Purchase.id == purchase_id)
        .first()
    )

    if not purchase:
        raise HTTPException(
            status_code=404,
            detail="Purchase not found"
        )

    try:
        for item in purchase.items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .first()
            )

            if product:
                product.quantity -= item.quantity

        db.delete(purchase)
        db.commit()

        return {
            "message": "Purchase deleted successfully"
        }

    except Exception:
        db.rollback()
        raise
