
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.role import require_role
from app.models.product import Product
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
)
from app.services.notification_service import create_notification

router = APIRouter(prefix="/products", tags=["Inventory"])


def validate_product_data(data):
    for field in ("product_name", "product_code", "category"):
        value = getattr(data, field, None)
        if value is not None:
            value = value.strip()
            if not value or value.lower() == "string":
                raise HTTPException(
                    status_code=422,
                    detail=f"{field.replace('_', ' ').title()} must be a valid value.",
                )

    quantity = getattr(data, "quantity", None)
    if quantity is not None and quantity < 0:
        raise HTTPException(
            status_code=422,
            detail="Stock quantity cannot be negative.",
        )

    price = getattr(data, "price", None)
    if price is not None and price < 0:
        raise HTTPException(
            status_code=422,
            detail="Product price cannot be negative.",
        )


@router.post(
    "/",
    response_model=ProductResponse,
    dependencies=[Depends(require_role("Admin", "HR"))],
)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    validate_product_data(product)

    existing = (
        db.query(Product)
        .filter(Product.product_code == product.product_code)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Product code already exists")

    try:
        new_product = Product(**product.model_dump())
        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        try:
            create_notification(
                db=db,
                title="New Product Added",
                message=f"{new_product.product_name} was added to inventory.",
                module="Inventory",
            )
        except Exception:
            # Notification failure should not undo a successfully created product.
            db.rollback()

        return new_product
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


@router.get("/", response_model=ProductListResponse)
def get_products(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if search:
        query = query.filter(
            or_(
                Product.product_name.ilike(f"%{search}%"),
                Product.product_code.ilike(f"%{search}%"),
            )
        )

    if category:
        query = query.filter(Product.category == category)

    total = query.count()
    total_pages = (total + limit - 1) // limit
    products = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "products": products,
    }


@router.get("/low-stock/", response_model=ProductListResponse)
def get_low_stock_products(
    threshold: int = Query(default=10, ge=0),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.quantity <= threshold)
    total = query.count()
    total_pages = (total + limit - 1) // limit
    products = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "products": products,
    }


@router.get("/sorted/", response_model=ProductListResponse)
def get_sorted_products(
    sort_by: str = Query(default="product_name"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    allowed_sort_fields = {
        "product_name": Product.product_name,
        "price": Product.price,
        "quantity": Product.quantity,
    }
    query = db.query(Product).order_by(
        allowed_sort_fields.get(sort_by, Product.product_name)
    )

    total = query.count()
    total_pages = (total + limit - 1) // limit
    products = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "products": products,
    }


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    dependencies=[Depends(require_role("Admin", "HR"))],
)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
):
    existing = db.query(Product).filter(Product.id == product_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product.model_dump(exclude_unset=True)
    validate_product_data(product)

    if "product_code" in update_data:
        duplicate = (
            db.query(Product)
            .filter(
                Product.product_code == update_data["product_code"],
                Product.id != product_id,
            )
            .first()
        )
        if duplicate:
            raise HTTPException(status_code=400, detail="Product code already exists")

    try:
        for key, value in update_data.items():
            setattr(existing, key, value)

        db.commit()
        db.refresh(existing)

        if "quantity" in update_data and existing.quantity < 10:
            try:
                create_notification(
                    db=db,
                    title="Low Stock Alert",
                    message=(
                        f"{existing.product_name} has only "
                        f"{existing.quantity} items remaining."
                    ),
                    module="Inventory",
                )
            except Exception:
                db.rollback()

        return existing
    except Exception:
        db.rollback()
        raise


@router.delete(
    "/{product_id}",
    dependencies=[Depends(require_role("Admin"))],
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        db.delete(product)
        db.commit()
        return {"message": "Product deleted successfully"}
    except Exception:
        db.rollback()
        raise
