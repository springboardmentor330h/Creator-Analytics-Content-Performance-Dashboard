from typing import Optional

from pydantic import BaseModel, EmailStr, Field, constr, field_validator

MAX_BCRYPT_PASSWORD_BYTES = 72
PUBLIC_REGISTER_ROLES = ('Creator', 'Agency', 'Marketing Team', 'Administrator')


def validate_password_bytes(password: str | None) -> str | None:
    if password is None:
        return password
    if len(password.encode('utf-8')) > MAX_BCRYPT_PASSWORD_BYTES:
        raise ValueError(
            f'Password must be at most {MAX_BCRYPT_PASSWORD_BYTES} bytes when UTF-8 encoded.'
        )
    return password


class LoginRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=8, max_length=72)

    _validate_password_bytes = field_validator('password', mode='before')(validate_password_bytes)


class RegisterRequest(BaseModel):
    full_name: constr(strip_whitespace=True, min_length=2, max_length=100)
    email: EmailStr
    password: constr(min_length=8, max_length=72)
    role: str = Field(default='Creator')
    accept_terms: bool = True

    _validate_password_bytes = field_validator('password', mode='before')(validate_password_bytes)

    @field_validator('role')
    @classmethod
    def validate_role(cls, value: str) -> str:
        cleaned = value.strip()
        if cleaned not in PUBLIC_REGISTER_ROLES:
            raise ValueError(
                f'Invalid role. Allowed registration roles: {", ".join(PUBLIC_REGISTER_ROLES)}'
            )
        return cleaned

    @field_validator('accept_terms')
    @classmethod
    def require_terms(cls, value: bool) -> bool:
        if not value:
            raise ValueError('You must accept the Terms & Conditions')
        return value


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class ProfileResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    status: str = 'active'
    agency_id: Optional[int] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    youtube_url: Optional[str] = None
    instagram_url: Optional[str] = None
    tiktok_url: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[constr(strip_whitespace=True, min_length=2, max_length=100)] = None
    bio: Optional[constr(strip_whitespace=True, max_length=1000)] = None
    avatar_url: Optional[constr(strip_whitespace=True, max_length=500)] = None
    youtube_url: Optional[constr(strip_whitespace=True, max_length=500)] = None
    instagram_url: Optional[constr(strip_whitespace=True, max_length=500)] = None
    tiktok_url: Optional[constr(strip_whitespace=True, max_length=500)] = None
    facebook_url: Optional[constr(strip_whitespace=True, max_length=500)] = None
    twitter_url: Optional[constr(strip_whitespace=True, max_length=500)] = None
    linkedin_url: Optional[constr(strip_whitespace=True, max_length=500)] = None
    website_url: Optional[constr(strip_whitespace=True, max_length=500)] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class AccountSettingsUpdate(BaseModel):
    email: Optional[EmailStr] = None
    current_password: Optional[constr(min_length=8, max_length=72)] = None
    new_password: Optional[constr(min_length=8, max_length=72)] = None

    _validate_new = field_validator('new_password', mode='before')(validate_password_bytes)
    _validate_current = field_validator('current_password', mode='before')(validate_password_bytes)
