"""
Security helpers: password hashing and JWT tokens.

WHY hash passwords?
We never store the real password. If the DB is ever leaked, hashed
passwords are computationally infeasible to reverse. bcrypt also adds
a random "salt" per password, so two identical passwords produce
different hashes.

WHY JWT?
After login, the server shouldn't have to re-check the DB on every
request just to know "who is this?". A JWT is a signed token the
client stores and sends back. The signature (using SECRET_KEY) proves
it wasn't tampered with, so we can trust its contents without a DB hit.
"""
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Builds a JWT. 'data' typically holds {"sub": user_id}.
    'exp' (expiry) is embedded in the token itself — the server checks
    it automatically when decoding.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Returns the decoded payload, or None if invalid/expired."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
