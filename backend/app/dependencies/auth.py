from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.connection import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        sub = payload.get("sub")
        email = payload.get("email") or (sub if isinstance(sub, str) and "@" in sub else None)
        user_id = payload.get("user_id") or (sub if isinstance(sub, str) and sub.isdigit() else None)

        if not email and not user_id:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Query user by email or ID
    query = db.query(User)
    if email:
        email_clean = email.strip().lower()
        user = query.filter(User.email == email_clean).first()
    elif user_id:
        user = query.filter(User.id == int(user_id)).first()
    else:
        user = None

    if user is None:
        raise credentials_exception

    if not getattr(user, "is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact your HR manager.",
        )

    return user