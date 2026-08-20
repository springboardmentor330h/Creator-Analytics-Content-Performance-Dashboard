# from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
# import jwt

# from app.core.security import SECRET_KEY, ALGORITHM
# # from app.schemas.user import TokenData 

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# # In-memory user database reference for auth validation
# # (Import or replace this with your actual DB layer as needed)
# db_users = {}


# async def get_current_user(token: str = Depends(oauth2_scheme)):
#     """Validates incoming JWT token and returns current authenticated user info."""
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         username: str = payload.get("sub")
#         if username is None:
#             raise credentials_exception
#         token_data = TokenData(username=username)
#     except jwt.PyJWTError:
#         raise credentials_exception

#     user = db_users.get(token_data.username)
#     if user is None:
#         raise credentials_exception
#     return user

#5 august 2026
from datetime import datetime, timedelta

from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


SECRET_KEY = "mysecretkey123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


def verify_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:
            return None

        return email

    except JWTError:
        return None


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    email = verify_access_token(token)

    if email is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return email

    ## authentication done