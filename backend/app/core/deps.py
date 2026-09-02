"""
Reusable FastAPI dependencies.

WHAT is a "dependency" in FastAPI?
A function you plug into a route's signature (via Depends(...)).
FastAPI runs it BEFORE your route function, and passes its return
value in. Here we use it to:
1. Pull the JWT out of the Authorization header.
2. Decode + validate it.
3. Fetch the matching User from the DB.
4. Reject the request early (401/403) if anything's wrong.

This means individual routes never repeat auth-checking code —
they just declare `current_user: User = Depends(get_current_user)`.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User, UserRole

# tokenUrl just tells Swagger UI where to POST to get a token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Role-based authorization: stack this on top of get_current_user
    for routes only admins should access.
    """
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user
