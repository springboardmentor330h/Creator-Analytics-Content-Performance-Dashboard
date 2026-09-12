from datetime import datetime, timedelta, timezone
from jose import jwt
from backend.app.core.config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
# 30 Days Token Expiration (60 mins * 24 hours * 30 days)
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt