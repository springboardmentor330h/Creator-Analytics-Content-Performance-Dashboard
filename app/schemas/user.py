from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import RoleEnum


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

    role: RoleEnum = RoleEnum.CREATOR


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

    role: RoleEnum = RoleEnum.CREATOR


# ============================================================
# USER UPDATE
# ============================================================
# ============================================================
# CREATOR PROFILE
# ============================================================
class CreatorProfileBase(BaseModel):
    display_name: Optional[str] = Field(default=None, max_length=100)
    bio: Optional[str] = None
    niche: Optional[str] = Field(default=None, max_length=100)
    social_links: Optional[str] = None
    follower_count: Optional[int] = Field(default=None, ge=0)


class CreatorProfileCreate(CreatorProfileBase):
    """Schema for creating/replacing a creator's profile."""
    pass


class CreatorProfileUpdate(CreatorProfileBase):
    """Schema for partially updating a creator's profile. All fields optional."""
    pass


class CreatorProfileResponse(CreatorProfileBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# AGENCY PROFILE
# ============================================================
class AgencyProfileBase(BaseModel):
    company_name: Optional[str] = Field(default=None, max_length=150)
    website: Optional[str] = Field(default=None, max_length=255)
    contact_person: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = None


class AgencyProfileCreate(AgencyProfileBase):
    """Schema for creating/replacing an agency's profile."""
    pass


class AgencyProfileUpdate(AgencyProfileBase):
    """Schema for partially updating an agency's profile. All fields optional."""
    pass


class AgencyProfileResponse(AgencyProfileBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# ACCOUNT SETTINGS
# ============================================================
class AccountSettingsUpdate(BaseModel):
    """
    Schema for a logged-in user updating their own account details.
    All fields optional; only provided fields are changed.
    """

    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None


class PasswordChangeRequest(BaseModel):
    """
    Schema for a logged-in user changing their own password.
    Requires the current password to confirm identity.
    """

    current_password: str = Field(min_length=1, max_length=72)
    new_password: str = Field(min_length=8, max_length=72)


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

    role: Optional[RoleEnum] = None