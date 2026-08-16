from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(bearerFormat='JWT', scheme_name='Bearer', auto_error=False)

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Could not validate credentials',
    headers={'WWW-Authenticate': 'Bearer'},
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise credentials_exception

    token_str = credentials.credentials.strip().strip('"').strip("'")
    if token_str.lower().startswith('bearer '):
        token_str = token_str[7:].strip()

    try:
        claims = decode_access_token(token_str)
    except Exception:
        raise credentials_exception

    user = None
    sub = claims.get('sub')
    if sub is not None:
        try:
            user_id = int(sub)
            user = db.get(User, user_id)
        except (ValueError, TypeError):
            pass

    if user is None:
        email = claims.get('email')
        if email:
            user = db.query(User).filter(User.email.ilike(email)).first()

    if user is None and sub and isinstance(sub, str) and '@' in sub:
        user = db.query(User).filter(User.email.ilike(sub)).first()

    if user is None:
        raise credentials_exception

    if user.status != 'active':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User account is inactive')

    return user


def require_role(*roles: str) -> Callable[[User], User]:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        allowed_roles_lower = {r.lower() for r in roles}
        user_role_lower = current_user.role.lower() if current_user.role else ''
        if user_role_lower not in allowed_roles_lower:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='You do not have permission to access this resource')
        return current_user
    return dependency


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    user_role_lower = current_user.role.lower() if current_user.role else ''
    if user_role_lower not in {'administrator', 'admin'}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Administrator access required')
    return current_user


def require_authenticated_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
