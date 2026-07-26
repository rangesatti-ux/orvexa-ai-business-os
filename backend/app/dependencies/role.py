from fastapi import Depends, HTTPException, status

from app.dependencies.auth import get_current_user


def require_role(*roles):

    def role_checker(current_user=Depends(get_current_user)):

        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to perform this action."
            )

        return current_user

    return role_checker