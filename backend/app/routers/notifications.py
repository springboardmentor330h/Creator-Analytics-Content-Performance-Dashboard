"""
Notification endpoints. All scoped to the logged-in creator via
get_current_user, same pattern as every other router in this project.
"""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.notification import NotificationType
from app.schemas.notification import (
    NotificationCreate, NotificationResponse, NotificationListResponse, NotificationUpdate,
)
from app.services import notification_service

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.post("/generate", response_model=list[NotificationResponse], status_code=status.HTTP_201_CREATED)
def generate_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Runs performance/engagement/revenue checks against the creator's
    current analytics and creates notifications warranted right now."""
    return notification_service.generate_all_alerts(db, current_user.id)


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    data: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.create_notification(db, current_user.id, data)


@router.get("/", response_model=NotificationListResponse)
def list_notifications(
    notification_type: Optional[NotificationType] = None,
    unread_only: bool = False,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total, unread_count = notification_service.list_notifications(
        db, current_user.id, notification_type, unread_only, skip, limit
    )
    return {"total": total, "unread_count": unread_count, "items": items}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_read_status(
    notification_id: uuid.UUID,
    data: NotificationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = notification_service.get_notification_by_id(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return notification_service.set_read_status(db, notification, data.is_read)


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = notification_service.get_notification_by_id(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notification_service.delete_notification(db, notification)
