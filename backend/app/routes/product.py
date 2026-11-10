from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role
from app.models.product import Product
from app.models.user import User
from app.models.audit_log import AuditLog
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
            value = str(value).strip()
            if not value or value.lower() == "string":
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"{field.replace('_', ' ').title()} must be a valid value.",
                )

    quantity = getattr(data, "quantity", None)
    if quantity is not None and quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Stock quantity cannot be negative.",
        )

    price = getattr(data, "price", None)
    if price is not None and price < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Product price cannot be negative.",
        )


@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Product",
)
async def create_product(
    request: Request,
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    validate_product_data(product)

    existing = (
        db.query(Product)
        .filter(Product.product_code == product.product_code.strip())
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product code already exists.",
        )

    try:
        new_product = Product(**product.model_dump())
        db.add(new_product)
        db.flush()

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Created product: {new_product.product_name} ({new_product.product_code})",
            module="Inventory",
            target_id=str(new_product.id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)

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
            pass

        return new_product

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


@router.get(
    "/",
    response_model=ProductListResponse,
    summary="Get Products",
)
async def get_products(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Product)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.product_name.ilike(search_term),
                Product.product_code.ilike(search_term),
                Product.category.ilike(search_term),
            )
        )

    if category:
        query = query.filter(Product.category == category)

    total = query.count()
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    products = query.order_by(Product.id.desc()).offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "products": products,
    }


@router.get(
    "/low-stock/",
    response_model=ProductListResponse,
    summary="Get Low Stock Products",
)
async def get_low_stock_products(
    threshold: int | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if threshold is not None:
        query = db.query(Product).filter(Product.quantity <= threshold)
    else:
        query = db.query(Product).filter(Product.quantity <= Product.min_stock_level)

    total = query.count()
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    products = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "products": products,
    }


@router.get(
    "/sorted/",
    response_model=ProductListResponse,
    summary="Get Sorted Products",
)
async def get_sorted_products(
    sort_by: str = Query(default="product_name"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    products = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "products": products,
    }


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get Single Product",
)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )
    return product


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update Product",
)
async def update_product(
    request: Request,
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    existing = db.query(Product).filter(Product.id == product_id).first()
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

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
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Product code already exists.",
            )

    try:
        for key, value in update_data.items():
            setattr(existing, key, value)

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Updated product ID #{product_id}: {existing.product_name}",
            module="Inventory",
            target_id=str(product_id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)

        db.commit()
        db.refresh(existing)

        if "quantity" in update_data and existing.quantity <= existing.min_stock_level:
            try:
                create_notification(
                    db=db,
                    title="Low Stock Alert",
                    message=f"{existing.product_name} has only {existing.quantity} items remaining.",
                    module="Inventory",
                )
            except Exception:
                pass

        return existing

    except Exception:
        db.rollback()
        raise


@router.delete(
    "/{product_id}",
    response_model=dict,
    summary="Delete Product (Admin Only)",
)
async def delete_product(
    request: Request,
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    try:
        prod_name = product.product_name
        db.delete(product)

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Deleted product ID #{product_id}: {prod_name}",
            module="Inventory",
            target_id=str(product_id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)

        db.commit()
        return {"message": "Product deleted successfully."}

    except Exception:
        db.rollback()
        raise