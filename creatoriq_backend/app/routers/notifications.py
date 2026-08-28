from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.notification import (
    NotificationCreate,
    NotificationListResponse,
    NotificationResponse,
)
from app.services import notification_service

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get("", response_model=NotificationListResponse)
def get_my_notifications(
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, unread_count = notification_service.list_notifications(
        db, current_user.id, unread_only=unread_only
    )
    return {
        "total": len(items),
        "unread_count": unread_count,
        "items": items,
    }


@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = notification_service.get_notification(
        db, notification_id, current_user.id
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif


@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    body: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Creators can only create notifications for themselves
    creator_id = current_user.id
    if body.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You can only create notifications for your own account",
        )
    if current_user.role == "admin":
        creator_id = body.creator_id

    return notification_service.create_notification(
        db,
        creator_id=creator_id,
        title=body.title,
        message=body.message,
        type=body.type.value if hasattr(body.type, "value") else body.type,
        link=body.link,
    )


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = notification_service.mark_as_read(
        db, notification_id, current_user.id
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif


@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = notification_service.mark_all_as_read(db, current_user.id)
    return {"message": "All notifications marked as read", "updated": count}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ok = notification_service.delete_notification(
        db, notification_id, current_user.id
    )
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted"}


@router.post("/alerts/run")
def run_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate performance, engagement, and revenue alerts
    from existing analytics / revenue data.
    """
    result = notification_service.run_all_alerts(db, current_user.id)
    return {
        "message": "Alert scan completed",
        **result,
    }
