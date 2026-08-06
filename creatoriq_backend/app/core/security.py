"""Password hashing and standards-compliant HS256 JWT helpers."""
import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Any

PBKDF2_ITERATIONS = 600_000
JWT_ALGORITHM = "HS256"
JWT_ISSUER = os.getenv("JWT_ISSUER", "creatoriq-api")
JWT_AUDIENCE = os.getenv("JWT_AUDIENCE", "creatoriq-client")
ACCESS_TOKEN_EXPIRE_SECONDS = int(os.getenv("ACCESS_TOKEN_EXPIRE_SECONDS", "900"))

# A random development key keeps local use safe. Production must provide a durable,
# high-entropy secret, otherwise a restart would invalidate every token.
_configured_secret = os.getenv("JWT_SECRET_KEY")
if not _configured_secret and os.getenv("ENVIRONMENT", "development").lower() == "production":
    raise RuntimeError("JWT_SECRET_KEY must be configured in production")
JWT_SECRET_KEY = (_configured_secret or secrets.token_urlsafe(48)).encode("utf-8")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return "pbkdf2_sha256${}${}${}".format(
        PBKDF2_ITERATIONS,
        base64.b64encode(salt).decode("ascii"),
        base64.b64encode(derived_key).decode("ascii"),
    )


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        scheme, iterations, encoded_salt, encoded_key = stored_hash.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        derived_key = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), base64.b64decode(encoded_salt), int(iterations)
        )
        return hmac.compare_digest(derived_key, base64.b64decode(encoded_key))
    except (TypeError, ValueError, UnicodeError):
        return False


def _b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def create_access_token(subject: str) -> str:
    now = int(time.time())
    header = _b64encode(json.dumps({"alg": JWT_ALGORITHM, "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64encode(json.dumps({
        "sub": subject, "iat": now, "exp": now + ACCESS_TOKEN_EXPIRE_SECONDS,
        "iss": JWT_ISSUER, "aud": JWT_AUDIENCE, "type": "access",
    }, separators=(",", ":")).encode())
    signing_input = f"{header}.{payload}".encode("ascii")
    signature = _b64encode(hmac.new(JWT_SECRET_KEY, signing_input, hashlib.sha256).digest())
    return f"{header}.{payload}.{signature}"


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        header, payload, signature = token.split(".")
        signing_input = f"{header}.{payload}".encode("ascii")
        expected = hmac.new(JWT_SECRET_KEY, signing_input, hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _b64decode(signature)):
            raise ValueError("invalid signature")
        decoded_header = json.loads(_b64decode(header))
        claims = json.loads(_b64decode(payload))
        if decoded_header != {"alg": JWT_ALGORITHM, "typ": "JWT"}:
            raise ValueError("invalid header")
        if (claims.get("iss") != JWT_ISSUER or claims.get("aud") != JWT_AUDIENCE or
                claims.get("type") != "access" or not isinstance(claims.get("sub"), str) or
                int(claims["exp"]) <= time.time()):
            raise ValueError("invalid claims")
        return claims
    except (KeyError, TypeError, ValueError, UnicodeError, json.JSONDecodeError):
        raise ValueError("invalid or expired access token") from None
