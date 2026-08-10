import base64
import hashlib
from cryptography.fernet import Fernet
from app.core.config import get_settings


def _get_fernet() -> Fernet:
    settings = get_settings()
    raw_key = getattr(settings, 'SOCIAL_TOKEN_ENCRYPTION_KEY', None) or settings.JWT_SECRET_KEY
    # Derive a valid 32-byte base64 Fernet key from raw_key using SHA256
    derived = hashlib.sha256(raw_key.encode('utf-8')).digest()
    fernet_key = base64.urlsafe_b64encode(derived)
    return Fernet(fernet_key)


def encrypt_token(plain_token: str | None) -> str | None:
    if not plain_token:
        return None
    fernet = _get_fernet()
    return fernet.encrypt(plain_token.encode('utf-8')).decode('utf-8')


def decrypt_token(encrypted_token: str | None) -> str | None:
    if not encrypted_token:
        return None
    try:
        fernet = _get_fernet()
        return fernet.decrypt(encrypted_token.encode('utf-8')).decode('utf-8')
    except Exception:
        return None
