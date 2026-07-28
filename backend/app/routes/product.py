from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi import Query
from sqlalchemy import or_

from app.database.connection import get_db
from app.models.product import Product
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse
)
from app.dependencies.role import require_role
from app.services.notification_service import create_notification

router = APIRouter(
    prefix="/products",
    tags=["Inventory"]
)

@router.post(
    "/",
    response_model=ProductResponse,
    dependencies=[Depends(require_role("Admin", "HR"))]
)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):

    existing = db.query(Product).filter(
        Product.product_code == product.product_code
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Product code already exists"
        )

    new_product = Product(**product.model_dump())

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    create_notification(
    db=db,
    title="New Product Added",
    message=f"{product.product_name} was added to inventory.",
    module="Inventory"
)

    return new_product

@router.get("/", response_model=ProductListResponse)
def get_products(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if search:
        query = query.filter(
            or_(
                Product.product_name.ilike(f"%{search}%"),
                Product.product_code.ilike(f"%{search}%")
            )
        )

    if category:
        query = query.filter(Product.category == category)

    total = query.count()

    total_pages = (total + limit - 1) // limit

    skip = (page - 1) * limit

    products = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "products": products
    }

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product

@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    dependencies=[Depends(require_role("Admin", "HR"))]
)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):
    existing_product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not existing_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    duplicate = db.query(Product).filter(
        Product.product_code == product.product_code,
        Product.id != product_id
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Product code already exists"
        )

    for key, value in product.model_dump().items():
        setattr(existing_product, key, value)

    db.commit()
    db.refresh(existing_product)

    if product.quantity < 10:
        create_notification(
            db=db,
            title="Low Stock Alert",
            message=f"{product.product_name} has only {product.quantity} items remaining.",
            module="Inventory"
    )
    
    return existing_product



@router.delete(
    "/{product_id}",
    dependencies=[Depends(require_role("Admin"))]
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }


@router.get("/low-stock/", response_model=ProductListResponse)
def get_low_stock_products(
    threshold: int = Query(default=10, ge=0),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1),
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.quantity <= threshold)

    total = query.count()
    total_pages = (total + limit - 1) // limit
    skip = (page - 1) * limit

    products = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "products": products
    }


@router.get("/sorted/", response_model=ProductListResponse)
def get_sorted_products(
    sort_by: str = Query(default="product_name"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if sort_by == "price":
        query = query.order_by(Product.price)

    elif sort_by == "quantity":
        query = query.order_by(Product.quantity)

    else:
        query = query.order_by(Product.product_name)

    total = query.count()
    total_pages = (total + limit - 1) // limit
    skip = (page - 1) * limit

    products = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "products": products
    }