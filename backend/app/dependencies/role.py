
from fastapi import Depends, HTTPException, status

from app.dependencies.auth import get_current_user


def require_role(*roles: str):
    allowed_roles = {
        role.strip().casefold()
        for role in roles
    }

    def role_checker(
        current_user=Depends(get_current_user),
    ):
        current_role = str(
            current_user.role or ""
        ).strip().casefold()

        if current_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to perform this action.",
            )

        return current_user

    return role_checker
