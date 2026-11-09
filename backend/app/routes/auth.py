
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status,
)
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role
from app.core.rate_limit import limiter


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# Public registration is disabled.
@router.post("/register")
def register():
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=(
            "Public registration is disabled. "
            "Contact your organization administrator."
        ),
    )


# Admin and HR can create organization accounts.
@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Admin", "HR")
    ),
):
    normalized_email = str(user.email).strip().lower()

    existing_user = (
        db.query(User)
        .filter(User.email == normalized_email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    new_user = User(
        full_name=user.full_name.strip(),
        email=normalized_email,
        password=hash_password(user.password),
        role=user.role,
        is_active=True,
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    except Exception:
        db.rollback()
        raise

    return new_user


# User login.
@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    normalized_email = form_data.username.strip().lower()

    db_user = (
        db.query(User)
        .filter(User.email == normalized_email)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(
        form_data.password,
        db_user.password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact HR.",
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "id": db_user.id,
            "role": db_user.role,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# Get the currently logged-in user's profile.
@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user
