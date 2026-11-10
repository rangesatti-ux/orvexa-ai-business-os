from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role
from app.models.supplier import Supplier
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
    SupplierListResponse,
)

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"],
)


@router.post(
    "/",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Supplier",
)
async def create_supplier(
    request: Request,
    supplier: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    existing = (
        db.query(Supplier)
        .filter(
            or_(
                Supplier.supplier_code == supplier.supplier_code.strip(),
                Supplier.phone == supplier.phone.strip(),
                Supplier.email == supplier.email.strip() if supplier.email else False,
                Supplier.gst_number == supplier.gst_number.strip() if supplier.gst_number else False,
            )
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Supplier with this code, phone, email, or GST number already exists.",
        )

    try:
        new_supplier = Supplier(
            **supplier.model_dump()
        )

        db.add(new_supplier)
        db.flush()

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Created supplier: {new_supplier.supplier_name} ({new_supplier.supplier_code})",
            module="Suppliers",
            target_id=str(new_supplier.id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)

        db.commit()
        db.refresh(new_supplier)

        return new_supplier

    except Exception:
        db.rollback()
        raise


@router.get(
    "/",
    response_model=SupplierListResponse,
    summary="Get Suppliers",
)
async def get_suppliers(
    search: str | None = Query(default=None),
    active: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Supplier)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Supplier.supplier_name.ilike(search_term),
                Supplier.supplier_code.ilike(search_term),
                Supplier.phone.ilike(search_term),
                Supplier.contact_person.ilike(search_term),
                Supplier.email.ilike(search_term),
            )
        )

    if active is not None:
        query = query.filter(
            Supplier.is_active.is_(active)
        )

    total = query.count()
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    skip = (page - 1) * limit

    suppliers = (
        query
        .order_by(Supplier.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "suppliers": suppliers,
    }


@router.get(
    "/dashboard/stats",
    summary="Supplier Dashboard Statistics",
)
async def supplier_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = str(current_user.role or "").strip().casefold()
    if role not in {"admin", "hr"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dashboard access requires Admin or HR role.",
        )

    total = db.query(Supplier).count()
    active = (
        db.query(Supplier)
        .filter(Supplier.is_active.is_(True))
        .count()
    )
    inactive = (
        db.query(Supplier)
        .filter(Supplier.is_active.is_(False))
        .count()
    )

    return {
        "total_suppliers": total,
        "active_suppliers": active,
        "inactive_suppliers": inactive,
    }


@router.get(
    "/{supplier_id}",
    response_model=SupplierResponse,
    summary="Get Single Supplier",
)
async def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found.",
        )

    return supplier


@router.put(
    "/{supplier_id}",
    response_model=SupplierResponse,
    summary="Update Supplier",
)
async def update_supplier(
    request: Request,
    supplier_id: int,
    supplier: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    existing = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found.",
        )

    update_data = supplier.model_dump(
        exclude_unset=True
    )

    if "supplier_code" in update_data:
        duplicate = (
            db.query(Supplier)
            .filter(
                Supplier.supplier_code == update_data["supplier_code"],
                Supplier.id != supplier_id,
            )
            .first()
        )
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Supplier code already exists.",
            )

    if "phone" in update_data:
        duplicate_phone = (
            db.query(Supplier)
            .filter(
                Supplier.phone == update_data["phone"],
                Supplier.id != supplier_id,
            )
            .first()
        )
        if duplicate_phone:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Supplier phone number already exists.",
            )

    if "email" in update_data and update_data["email"]:
        duplicate_email = (
            db.query(Supplier)
            .filter(
                Supplier.email == update_data["email"],
                Supplier.id != supplier_id,
            )
            .first()
        )
        if duplicate_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Supplier email already exists.",
            )

    try:
        for key, value in update_data.items():
            setattr(existing, key, value)

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Updated supplier ID #{supplier_id}: {existing.supplier_name}",
            module="Suppliers",
            target_id=str(supplier_id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)

        db.commit()
        db.refresh(existing)

        return existing

    except Exception:
        db.rollback()
        raise


@router.delete(
    "/{supplier_id}",
    response_model=dict,
    summary="Delete Supplier (Admin Only)",
)
async def delete_supplier(
    request: Request,
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found.",
        )

    try:
        sup_name = supplier.supplier_name
        db.delete(supplier)

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Deleted supplier ID #{supplier_id}: {sup_name}",
            module="Suppliers",
            target_id=str(supplier_id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)

        db.commit()

        return {
            "message": "Supplier deleted successfully."
        }

    except Exception:
        db.rollback()
        raise