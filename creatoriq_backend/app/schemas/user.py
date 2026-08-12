from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ============================================================
# USER REGISTRATION
# ============================================================
class UserRegister(BaseModel):
    """
    Schema used when registering a new user.
    """

    full_name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=72
    )

    role: str = "user"


# ============================================================
# LOGIN REQUEST
# ============================================================
class LoginRequest(BaseModel):
    """
    Schema used when a user logs in.
    """

    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=72
    )


# ============================================================
# TOKEN RESPONSE
# ============================================================
class TokenResponse(BaseModel):
    """
    Response returned after successful login.
    """

    access_token: str
    token_type: str


# ============================================================
# USER RESPONSE
# ============================================================
class UserResponse(BaseModel):
    """
    Public user information.

    Password is intentionally not included.
    """

    id: int
    full_name: str
    email: EmailStr
    role: str

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# USER SEARCH RESPONSE
# ============================================================
class UserSearchResponse(BaseModel):
    """
    Response for searching users by role.
    """

    total: int
    users: list[UserResponse]


# ============================================================
# USER CREATE
# ============================================================
class UserCreate(BaseModel):
    """
    Schema used by the CRUD create-user endpoint.
    """

    full_name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=72
    )

    role: str = "user"


# ============================================================
# USER UPDATE
# ============================================================
class UserUpdate(BaseModel):
    """
    Schema used when updating an existing user.

    All fields are optional so that the user can update
    only the fields they need.
    """

    full_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    email: Optional[EmailStr] = None

    password: Optional[str] = Field(
        default=None,
        min_length=8,
        max_length=72
    )

    role: Optional[str] = None