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


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    Validate JWT and return the authenticated user.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
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


# ============================================================
# REQUIRE CREATOR
# ============================================================

def require_creator(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Allow only Creator accounts.
    """

    if current_user.role != "Creator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Creator access required",
        )

    return current_user


# ============================================================
# REQUIRE ADMINISTRATOR
# ============================================================

def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Allow only Administrator accounts.
    """

    if current_user.role != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )

    return current_user


# ============================================================
# CREATOR DATA SCOPE
# ============================================================

def get_creator_scope(
    current_user: User = Depends(get_current_user),
) -> int | None:
    """
    Determine which creator's data the user can access.

    Creator:
        Returns their own user ID.

    Administrator:
        Returns None, meaning all creators.

    Other roles:
        Access denied.
    """

    if current_user.role == "Creator":
        return current_user.id

    if current_user.role == "Administrator":
        return None

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have access to creator analytics",
    )