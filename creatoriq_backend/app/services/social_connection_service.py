import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from jose import jwt
from app.core.config import get_settings
from app.integrations import INTEGRATIONS, get_integration
from app.models.social_connection import SocialConnection, ALLOWED_PLATFORMS
from app.models.user import User
from app.schemas.social_connection import OAuthInitResponse, SyncResultResponse
from app.utils.crypto import decrypt_token, encrypt_token

# In-memory transient state store for OAuth state validation (state -> {user_id, platform, expires_at})
_OAUTH_STATES: Dict[str, Dict] = {}


def clean_expired_states():
    now = datetime.utcnow()
    expired = [k for k, v in _OAUTH_STATES.items() if v.get('expires_at') and v.get('expires_at') < now]
    for k in expired:
        _OAUTH_STATES.pop(k, None)


def generate_oauth_state(user_id: int, platform: str) -> str:
    """Generate a cryptographically signed state token encoding user_id and platform."""
    clean_expired_states()
    settings = get_settings()
    now = datetime.utcnow()
    payload = {
        "sub": str(user_id),
        "user_id": user_id,
        "platform": platform.lower().strip(),
        "nonce": secrets.token_hex(16),
        "exp": now + timedelta(minutes=30),
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    _OAUTH_STATES[token] = {
        "user_id": user_id,
        "platform": platform.lower().strip(),
        "expires_at": now + timedelta(minutes=30),
    }
    return token


def parse_and_validate_oauth_state(state: str, expected_platform: str) -> int:
    """Validate OAuth state and extract the originating user_id.

    Supports both signed JWT tokens and in-memory fallback for backward compatibility.
    """
    clean_expired_states()
    settings = get_settings()
    expected_key = expected_platform.lower().strip()

    # 1. Attempt decoding as signed JWT
    try:
        payload = jwt.decode(state, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        state_platform = str(payload.get("platform", "")).lower().strip()
        uid = int(payload.get("user_id") or payload.get("sub", 0))
        if state_platform and state_platform == expected_key and uid > 0:
            _OAUTH_STATES.pop(state, None)
            return uid
    except Exception:
        pass

    # 2. In-memory cache fallback
    state_data = _OAUTH_STATES.pop(state, None)
    if state_data:
        if state_data.get("expires_at") and state_data["expires_at"] < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OAuth state parameter has expired. Please initiate connection again.",
            )
        if state_data.get("platform") != expected_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OAuth state platform mismatch.",
            )
        return int(state_data["user_id"])

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid, missing, or expired OAuth state parameter. Request rejected for security.",
    )


class SocialConnectionService:
    @staticmethod
    def get_user_connections(db: Session, user: User) -> List[SocialConnection]:
        """Fetch social connections for user (or agency creator scope if applicable)."""
        clean_expired_states()
        
        # If user is Agency, they can view assigned creators' connections if target user specified, but default to user's own
        connections = db.query(SocialConnection).filter(SocialConnection.user_id == user.id).all()
        existing_map = {conn.platform.lower(): conn for conn in connections}

        # Build list of 6 platforms with actual or default status
        result = []
        for platform_key in ALLOWED_PLATFORMS:
            integration = INTEGRATIONS[platform_key]
            if platform_key in existing_map:
                conn = existing_map[platform_key]
                # If integration credentials removed, reflect not_configured status
                if not integration.is_configured() and conn.status == 'not_configured':
                    conn.status = 'not_configured'
                conn.account_name = conn.display_name or conn.platform_username or (user.full_name if conn.status == 'connected' else None)
                conn.connection_mode = "live" if (integration.is_configured() or platform_key == "youtube") else "manual"
                result.append(conn)
            else:
                # Create transient unpersisted model for frontend representation
                is_cfg = integration.is_configured()
                default_status = 'disconnected' if is_cfg else 'not_configured'
                dummy = SocialConnection(
                    id=0,
                    user_id=user.id,
                    platform=platform_key,
                    status=default_status,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                dummy.account_name = None
                dummy.connection_mode = "live" if (is_cfg or platform_key == "youtube") else "manual"
                result.append(dummy)

        return result

    @staticmethod
    def get_connection_by_platform(db: Session, user_id: int, platform: str) -> Optional[SocialConnection]:
        from sqlalchemy import func
        platform_key = platform.lower().strip()
        return db.query(SocialConnection).filter(
            SocialConnection.user_id == user_id,
            func.lower(SocialConnection.platform) == platform_key,
        ).first()

    @staticmethod
    def initiate_oauth(platform: str, user_id: int) -> OAuthInitResponse:
        platform_key = platform.lower().strip()
        integration = get_integration(platform_key)

        if not integration.is_configured():
            return OAuthInitResponse(
                platform=platform_key,
                configured=False,
                authorization_url=None,
                state=None,
                message=f"Integration for {integration.display_name} is not configured. API client credentials required in backend .env.",
            )

        state_token = generate_oauth_state(user_id, platform_key)

        try:
            auth_url = integration.get_authorization_url(state=state_token)
            return OAuthInitResponse(
                platform=platform_key,
                configured=True,
                authorization_url=auth_url,
                state=state_token,
                message="OAuth authorization URL generated successfully.",
            )
        except ValueError as exc:
            return OAuthInitResponse(
                platform=platform_key,
                configured=False,
                authorization_url=None,
                state=None,
                message=str(exc),
            )

    @staticmethod
    async def get_valid_access_token(db: Session, user_id: int, platform: str) -> str:
        """Retrieve decrypted access token, automatically refreshing it if expired."""
        platform_key = platform.lower().strip()
        connection = SocialConnectionService.get_connection_by_platform(db, user_id, platform_key)
        if not connection or connection.status != 'connected':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Platform '{platform}' is not connected. Please connect your account first.",
            )

        integration = get_integration(platform_key)
        plain_access_token = decrypt_token(connection.access_token_encrypted)

        # Check if expired or within 60s of expiring
        is_expired = False
        if connection.token_expires_at:
            if connection.token_expires_at <= datetime.utcnow() + timedelta(seconds=60):
                is_expired = True

        if is_expired:
            plain_refresh_token = decrypt_token(connection.refresh_token_encrypted)
            if plain_refresh_token:
                try:
                    refreshed = await integration.refresh_token(plain_refresh_token)
                    if refreshed.get('access_token'):
                        plain_access_token = refreshed['access_token']
                        connection.access_token_encrypted = encrypt_token(plain_access_token)
                        if refreshed.get('expires_in'):
                            connection.token_expires_at = datetime.utcnow() + timedelta(seconds=int(refreshed['expires_in']))
                        db.commit()
                        db.refresh(connection)
                except Exception as exc:
                    connection.status = 'expired'
                    db.commit()
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=f"OAuth token for {integration.display_name} has expired and could not be refreshed. Please reconnect your account.",
                    ) from exc
            else:
                connection.status = 'expired'
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"OAuth token for {integration.display_name} has expired. Please reconnect your account.",
                )

        if not plain_access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No valid access token available for {integration.display_name}. Please reconnect your account.",
            )

        return plain_access_token

    @staticmethod
    async def process_oauth_callback(
        db: Session,
        platform: str,
        code: str,
        state: str,
        provided_user_id: Optional[int] = None,
    ) -> SocialConnection:
        clean_expired_states()
        platform_key = platform.lower().strip()
        integration = get_integration(platform_key)

        # Robust cryptographic state validation
        target_user_id = parse_and_validate_oauth_state(state, platform_key)

        if provided_user_id and provided_user_id != target_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Authenticated user mismatch during OAuth callback validation.",
            )

        # Token exchange
        try:
            token_data = await integration.exchange_code(code=code, state=state)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"OAuth token exchange failed for {integration.display_name}: {str(exc)}",
            )

        # Encrypt tokens securely
        access_token_enc = encrypt_token(token_data.get('access_token'))
        refresh_token_enc = encrypt_token(token_data.get('refresh_token'))
        
        expires_in = token_data.get('expires_in')
        token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in) if expires_in else None

        # Case-insensitive lookup with duplicate prevention
        existing_conns = db.query(SocialConnection).filter(
            SocialConnection.user_id == target_user_id,
            func.lower(SocialConnection.platform) == platform_key.lower(),
        ).all()

        if len(existing_conns) > 1:
            connection = existing_conns[0]
            for extra in existing_conns[1:]:
                db.delete(extra)
            db.flush()
        elif len(existing_conns) == 1:
            connection = existing_conns[0]
        else:
            connection = SocialConnection(
                user_id=target_user_id,
                platform=platform_key,
            )
            db.add(connection)

        connection.platform_user_id = str(token_data.get('platform_user_id') or '')
        connection.platform_username = token_data.get('platform_username') or ''
        connection.display_name = token_data.get('display_name') or integration.display_name
        connection.profile_url = token_data.get('profile_url')
        connection.access_token_encrypted = access_token_enc
        connection.refresh_token_encrypted = refresh_token_enc
        connection.token_expires_at = token_expires_at
        connection.scopes = token_data.get('scopes')
        connection.status = 'connected'
        connection.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(connection)

        # Trigger initial synchronization immediately upon connection
        try:
            plain_token = decrypt_token(access_token_enc)
            items_synced = await integration.sync_data(db, target_user_id, plain_token or '')
            if items_synced > 0:
                connection.last_synced_at = datetime.utcnow()
                db.commit()
                db.refresh(connection)
            else:
                from app.services.social_media import sync_platform_data
                target_user = db.get(User, target_user_id)
                if target_user:
                    sync_platform_data(db, target_user, platform_key)
                    db.refresh(connection)
        except Exception:
            pass

        return connection

    @staticmethod
    async def sync_connection(db: Session, user: User, platform: str) -> SyncResultResponse:
        platform_key = platform.lower().strip()
        connection = SocialConnectionService.get_connection_by_platform(db, user.id, platform_key)

        if not connection or connection.status != 'connected':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot sync unconnected platform '{platform}'. Please connect the account first.",
            )

        integration = get_integration(platform_key)
        plain_access_token = await SocialConnectionService.get_valid_access_token(db, user.id, platform_key)

        # Perform sync
        try:
            items_synced = await integration.sync_data(db, user.id, plain_access_token or '')
            connection.last_synced_at = datetime.utcnow()
            connection.status = 'connected'
            db.commit()

            return SyncResultResponse(
                platform=platform_key,
                status='connected',
                last_synced_at=connection.last_synced_at,
                items_synced=items_synced,
                message=f"Successfully synchronized data from {integration.display_name}.",
            )
        except Exception as exc:
            connection.status = 'error'
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to sync data from {integration.display_name}: {str(exc)}",
            )

    @staticmethod
    def disconnect_connection(db: Session, user: User, platform: str) -> SocialConnection:
        platform_key = platform.lower().strip()
        connection = SocialConnectionService.get_connection_by_platform(db, user.id, platform_key)

        if not connection:
            integration = get_integration(platform_key)
            default_status = 'disconnected' if integration.is_configured() else 'not_configured'
            return SocialConnection(
                id=0,
                user_id=user.id,
                platform=platform_key,
                status=default_status,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

        # Securely wipe tokens and reset connection status
        connection.access_token_encrypted = None
        connection.refresh_token_encrypted = None
        connection.status = 'disconnected' if get_integration(platform_key).is_configured() else 'not_configured'
        connection.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(connection)
        return connection
