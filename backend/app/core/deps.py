"""
CURRENT BEHAVIOR (no auth yet):
The frontend sends the chosen role in an `X-Role` header on every request.
This function just reads that header and returns it.

WHEN YOU ADD REAL AUTH LATER:
Replace the body of `get_current_role` with JWT decoding (using
core/security.py, which is already written). Every router that depends on
`get_current_role` will keep working unchanged, because the *shape* of what
it returns (a role string) stays the same.
"""

from fastapi import Header, HTTPException
from app.models.user import RoleEnum

def get_current_role(x_role: str = Header(default=None)) -> str:
    if x_role is None or x_role not in RoleEnum._value2member_map_:
        raise HTTPException(status_code=400, detail="Missing or invalid X-Role header")
    return x_role

def require_role(*roles):
    def role_checker(current_role: str = Header(default=None, alias="X-Role")):
        role = get_current_role(current_role)
        if role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return role
    return role_checker