from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import assert_owner_or_admin, get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationListResponse, NotificationResponse
from app.services.notification_service import (
    generate_notifications,
    get_notifications_for_creator,
    mark_as_read,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/generate/{creator_id}", response_model=list[NotificationResponse])
def generate(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_owner_or_admin(current_user, creator_id)
    return generate_notifications(db, creator_id)


@router.get("/creator/{creator_id}", response_model=NotificationListResponse)
def list_for_creator(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_owner_or_admin(current_user, creator_id)
    notifications = get_notifications_for_creator(db, creator_id)
    unread = sum(1 for n in notifications if not n.is_read)

    return {"total": len(notifications), "unread": unread, "notifications": notifications}


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = mark_as_read(db, notification_id, current_user)
    if not note:
        raise HTTPException(status_code=404, detail="Notification not found")
    return note
