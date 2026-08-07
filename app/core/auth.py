from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.user import User


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Validate JWT and return the authenticated user.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise credentials_exception

    return user


def require_roles(*allowed_roles: str):
    """
    Dependency factory for role-based access control (RBAC).

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_roles("administrator"))])

    Or to also get the user object:
        def endpoint(current_user: User = Depends(require_roles("administrator"))):
            ...

    Raises 403 if the authenticated user's role is not in allowed_roles.
    Role comparison is case-insensitive so legacy values like "Admin"
    still work if they happen to match (case-insensitively) one of the
    allowed roles passed in.
    """

    normalized_allowed = {role.lower() for role in allowed_roles}

    def dependency(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if (current_user.role or "").lower() not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission to perform this action. "
                    f"Required role(s): {', '.join(sorted(normalized_allowed))}."
                )
            )
        return current_user

    return dependency