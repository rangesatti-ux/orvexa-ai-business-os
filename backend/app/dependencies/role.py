from typing import Set, Union
from fastapi import Depends, HTTPException, status

from app.dependencies.auth import get_current_user
from app.models.user import User


def require_role(*roles: Union[str, list, tuple]):
    """
    Dependency factory to restrict endpoint access by role.
    Accepts roles as separate positional arguments or a list/tuple.
    """
    flattened_roles: Set[str] = set()
    for role in roles:
        if isinstance(role, (list, tuple, set)):
            flattened_roles.update(str(r).strip().casefold() for r in role if r)
        elif isinstance(role, str) and role.strip():
            flattened_roles.add(role.strip().casefold())

    def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        current_role = str(getattr(current_user, "role", "") or "").strip().casefold()

        # Admin master permission check
        if current_role == "admin" or current_role in flattened_roles:
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to perform this action.",
        )

    return role_checker