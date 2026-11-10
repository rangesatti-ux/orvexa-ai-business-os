from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role
from app.models.customer import Customer
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerListResponse,
)

router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
)


@router.post(
    "/",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Customer Record",
)
async def create_customer(
    request: Request,
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    existing = (
        db.query(Customer)
        .filter(
            or_(
                Customer.customer_code == customer.customer_code,
                Customer.phone == customer.phone,
            )
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer with this code or phone number already exists.",
        )

    try:
        new_customer = Customer(
            **customer.model_dump()
        )

        db.add(new_customer)
        db.commit()
        db.refresh(new_customer)

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Created customer: {new_customer.full_name} ({new_customer.customer_code})",
            module="Customers",
            target_id=str(new_customer.id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)
        db.commit()

        return new_customer

    except Exception:
        db.rollback()
        raise


@router.get(
    "/",
    response_model=CustomerListResponse,
    summary="List and Search Customers",
)
async def get_customers(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Customer)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Customer.full_name.ilike(search_term),
                Customer.phone.ilike(search_term),
                Customer.customer_code.ilike(search_term),
                Customer.email.ilike(search_term),
            )
        )

    total = query.count()
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    skip = (page - 1) * limit

    customers = (
        query.order_by(Customer.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "customers": customers,
    }


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get Customer Details",
)
async def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    return customer


@router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Update Customer Record",
)
async def update_customer(
    request: Request,
    customer_id: int,
    customer: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "HR")),
):
    existing = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    update_data = customer.model_dump(
        exclude_unset=True
    )

    if "customer_code" in update_data:
        duplicate = (
            db.query(Customer)
            .filter(
                Customer.customer_code == update_data["customer_code"],
                Customer.id != customer_id,
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Customer code already exists.",
            )

    if "phone" in update_data:
        duplicate_phone = (
            db.query(Customer)
            .filter(
                Customer.phone == update_data["phone"],
                Customer.id != customer_id,
            )
            .first()
        )

        if duplicate_phone:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Customer phone number already exists.",
            )

    try:
        for key, value in update_data.items():
            setattr(existing, key, value)

        db.commit()
        db.refresh(existing)

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Updated customer ID #{customer_id}: {existing.full_name}",
            module="Customers",
            target_id=str(customer_id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)
        db.commit()

        return existing

    except Exception:
        db.rollback()
        raise


@router.delete(
    "/{customer_id}",
    response_model=dict,
    summary="Delete Customer Record (Admin Only)",
)
async def delete_customer(
    request: Request,
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    try:
        cust_name = customer.full_name
        db.delete(customer)
        db.commit()

        audit = AuditLog(
            user_id=current_user.id,
            username=current_user.email,
            role=current_user.role,
            action=f"Deleted customer ID #{customer_id}: {cust_name}",
            module="Customers",
            target_id=str(customer_id),
            ip_address=request.client.host if request.client else None,
        )
        db.add(audit)
        db.commit()

        return {
            "message": "Customer deleted successfully."
        }

    except Exception:
        db.rollback()
        raise