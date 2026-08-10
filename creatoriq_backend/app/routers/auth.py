from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import (
    AccountSettingsUpdate,
    ForgotPasswordRequest,
    LoginRequest,
    ProfileResponse,
    ProfileUpdateRequest,
    RegisterRequest,
    TokenResponse,
)
from app.services.user_service import UserAlreadyExistsError, create_user, get_user_by_email, update_user

router = APIRouter(prefix='/auth', tags=['authentication'])


def _profile_response(user: User) -> ProfileResponse:
    return ProfileResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        status=user.status,
        agency_id=user.agency_id,
        bio=user.bio,
        avatar_url=user.avatar_url,
        youtube_url=user.youtube_url,
        instagram_url=user.instagram_url,
        tiktok_url=user.tiktok_url,
        facebook_url=user.facebook_url,
        twitter_url=user.twitter_url,
        linkedin_url=user.linkedin_url,
        website_url=user.website_url,
    )


@router.post('/register', response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    try:
        user = create_user(
            db,
            full_name=payload.full_name,
            email=email,
            password=payload.password,
            role=payload.role,
        )
    except UserAlreadyExistsError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Email already registered')
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return _profile_response(user)


@router.post('/login', response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, credentials.email)
    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid email or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    if user.status != 'active':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User account is inactive')
    access_token = create_access_token(subject=str(user.id), email=user.email, role=user.role)
    return TokenResponse(access_token=access_token)


@router.post('/logout')
def logout(current_user: User = Depends(get_current_user)):
    return {'success': True, 'message': 'Logged out successfully'}


@router.get('/profile', response_model=ProfileResponse)
def profile(current_user: User = Depends(get_current_user)):
    return _profile_response(current_user)


@router.put('/profile', response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return _profile_response(current_user)


@router.put('/account-settings', response_model=ProfileResponse)
def update_account_settings(
    payload: AccountSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updates = payload.model_dump(exclude_unset=True)
    email = updates.get('email')
    new_password = updates.get('new_password')
    current_password = updates.get('current_password')

    if new_password:
        if not current_password or not verify_password(current_password, current_user.password_hash):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Current password is incorrect')
        current_user.password_hash = hash_password(new_password)

    if email and email.lower() != current_user.email:
        try:
            update_user(db, current_user, email=email)
            db.refresh(current_user)
            return _profile_response(current_user)
        except UserAlreadyExistsError:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Email already registered')

    db.commit()
    db.refresh(current_user)
    return _profile_response(current_user)


@router.post('/forgot-password')
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, payload.email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return {'success': True, 'message': 'Password reset flow is available in development mode'}
