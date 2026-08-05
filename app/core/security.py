from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings


# ============================================================
# PASSWORD HASHING
# ============================================================

# bcrypt is used to securely hash passwords.
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    """
    Hash a plain-text password.

    The original password is never stored in the database.
    """
    return pwd_context.hash(password)


def get_password_hash(password: str) -> str:
    """
    Alternative name for password hashing.

    This is kept because different parts of the project
    may use different function names.
    """
    return hash_password(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """
    Check whether a plain-text password matches
    the stored password hash.
    """

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ============================================================
# JWT ACCESS TOKEN
# ============================================================

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
) -> str:
    """
    Create a JWT access token.

    Args:
        data: Information to store inside the token.
        expires_delta: Optional custom expiration time.

    Returns:
        Encoded JWT token.
    """

    # Copy the data so the original dictionary is not modified.
    to_encode = data.copy()

    # Calculate expiration time.
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    # Add expiration to JWT payload.
    to_encode.update({
        "exp": expire
    })

    # Create JWT token.
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt