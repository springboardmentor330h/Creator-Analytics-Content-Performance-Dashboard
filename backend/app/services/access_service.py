from sqlalchemy.orm import Session
from app.models.contract import ManagementContract
from app.models.user import User
from fastapi import HTTPException


def get_allowed_creator_ids(db: Session, current_user: User) -> list[int] | None:
    if current_user.role == "admin":
        return None

    if current_user.role == "creator":
        return [current_user.creator_id] if current_user.creator_id is not None else []

    if current_user.role in ("agency", "marketing_team"):
        contracts = (
            db.query(ManagementContract)
            .filter(
                ManagementContract.manager_user_id == current_user.id,
                ManagementContract.status == "active",
            )
            .all()
        )
        return [c.creator_id for c in contracts]

    return []

from fastapi import HTTPException

def resolve_creator_filter(db, current_user, requested_creator_id: int | None) -> list[int] | None:
    
    allowed = get_allowed_creator_ids(db, current_user)
    if requested_creator_id is None:
        return allowed
    if allowed is not None and requested_creator_id not in allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this creator's data")
    return [requested_creator_id]