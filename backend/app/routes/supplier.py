from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.connection import get_db
from app.dependencies.role import require_role
from app.models.supplier import Supplier
from app.schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
    SupplierListResponse
)

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"]
)


@router.post(
    "/",
    response_model=SupplierResponse,
    dependencies=[Depends(require_role("Admin", "HR"))]
)
def create_supplier(
    supplier: SupplierCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(Supplier).filter(
        or_(
            Supplier.supplier_code == supplier.supplier_code,
            Supplier.phone == supplier.phone,
            Supplier.email == supplier.email,
            Supplier.gst_number == supplier.gst_number
        )
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Supplier already exists"
        )

    new_supplier = Supplier(**supplier.model_dump())

    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)

    return new_supplier


@router.get("/", response_model=SupplierListResponse)
def get_suppliers(
    search: str | None = Query(None),
    active: bool | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db)
):

    query = db.query(Supplier)

    if search:
        query = query.filter(
            or_(
                Supplier.supplier_name.ilike(f"%{search}%"),
                Supplier.supplier_code.ilike(f"%{search}%"),
                Supplier.phone.ilike(f"%{search}%"),
                Supplier.contact_person.ilike(f"%{search}%")
            )
        )

    if active is not None:
        query = query.filter(
            Supplier.is_active == active
        )

    total = query.count()

    total_pages = (total + limit - 1) // limit

    suppliers = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "suppliers": suppliers
    }


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db)
):

    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id
    ).first()

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    return supplier


@router.put(
    "/{supplier_id}",
    response_model=SupplierResponse,
    dependencies=[Depends(require_role("Admin", "HR"))]
)
def update_supplier(
    supplier_id: int,
    supplier: SupplierUpdate,
    db: Session = Depends(get_db)
):

    existing = db.query(Supplier).filter(
        Supplier.id == supplier_id
    ).first()

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    duplicate = db.query(Supplier).filter(
        Supplier.supplier_code == supplier.supplier_code,
        Supplier.id != supplier_id
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Supplier code already exists"
        )

    for key, value in supplier.model_dump().items():
        setattr(existing, key, value)

    db.commit()
    db.refresh(existing)

    return existing


@router.delete(
    "/{supplier_id}",
    dependencies=[Depends(require_role("Admin"))]
)
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db)
):

    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id
    ).first()

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    db.delete(supplier)
    db.commit()

    return {
        "message": "Supplier deleted successfully"
    }


@router.get("/dashboard/stats")
def supplier_dashboard(
    db: Session = Depends(get_db)
):

    total = db.query(Supplier).count()

    active = db.query(Supplier).filter(
        Supplier.is_active == True
    ).count()

    inactive = db.query(Supplier).filter(
        Supplier.is_active == False
    ).count()

    return {
        "total_suppliers": total,
        "active_suppliers": active,
        "inactive_suppliers": inactive
    }