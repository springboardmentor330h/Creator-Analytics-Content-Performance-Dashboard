from sqlalchemy.orm import Session
from app.models.contract import ManagementContract
from app.models.user import User


def get_allowed_creator_ids(db: Session, current_user: User) -> list[int] | None:
    """None means unrestricted (admin only)."""
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