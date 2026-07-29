from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.connection import get_db
from app.models.customer import Customer
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerListResponse
)
from app.dependencies.role import require_role

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


@router.post(
    "/",
    response_model=CustomerResponse,
    dependencies=[Depends(require_role("Admin", "HR"))]
)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(Customer).filter(
        or_(
            Customer.customer_code == customer.customer_code,
            Customer.phone == customer.phone
        )
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Customer already exists"
        )

    new_customer = Customer(**customer.model_dump())

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


@router.get("/", response_model=CustomerListResponse)
def get_customers(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1),
    db: Session = Depends(get_db)
):

    query = db.query(Customer)

    if search:
        query = query.filter(
            or_(
                Customer.full_name.ilike(f"%{search}%"),
                Customer.phone.ilike(f"%{search}%"),
                Customer.customer_code.ilike(f"%{search}%")
            )
        )

    total = query.count()

    total_pages = (total + limit - 1) // limit

    skip = (page - 1) * limit

    customers = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "customers": customers
    }


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):

    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return customer


@router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
    dependencies=[Depends(require_role("Admin", "HR"))]
)
def update_customer(
    customer_id: int,
    customer: CustomerUpdate,
    db: Session = Depends(get_db)
):

    existing = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    duplicate = db.query(Customer).filter(
        Customer.customer_code == customer.customer_code,
        Customer.id != customer_id
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Customer code already exists"
        )

    for key, value in customer.model_dump().items():
        setattr(existing, key, value)

    db.commit()
    db.refresh(existing)

    return existing


@router.delete(
    "/{customer_id}",
    dependencies=[Depends(require_role("Admin"))]
)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):

    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    db.delete(customer)
    db.commit()

    return {
        "message": "Customer deleted successfully"
    }