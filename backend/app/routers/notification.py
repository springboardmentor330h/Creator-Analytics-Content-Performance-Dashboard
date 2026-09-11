from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse
)

from app.services.notification_service import (
    create_notification,
    get_creator_notifications,
    get_notification,
    mark_notification_read,
    delete_notification,
    get_unread_count
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =========================================================
# CREATE NOTIFICATION
# =========================================================

@router.post(
    "",
    response_model=NotificationResponse,
    status_code=201
)
def add_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db)
):
    return create_notification(
        db,
        notification_data
    )


# =========================================================
# GET CREATOR NOTIFICATIONS
# =========================================================

@router.get(
    "/creator/{creator_id}",
    response_model=list[NotificationResponse]
)
def get_notifications(
    creator_id: int,
    db: Session = Depends(get_db)
):
    return get_creator_notifications(
        db,
        creator_id
    )


# =========================================================
# GET UNREAD NOTIFICATION COUNT
# =========================================================

@router.get("/creator/{creator_id}/unread-count")
def unread_count(
    creator_id: int,
    db: Session = Depends(get_db)
):
    count = get_unread_count(
        db,
        creator_id
    )

    return {
        "creator_id": creator_id,
        "unread_count": count
    }


# =========================================================
# GET SINGLE NOTIFICATION
# =========================================================

@router.get(
    "/{notification_id}",
    response_model=NotificationResponse
)
def get_single_notification(
    notification_id: int,
    creator_id: int,
    db: Session = Depends(get_db)
):
    notification = get_notification(
        db,
        notification_id,
        creator_id
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification


# =========================================================
# MARK NOTIFICATION AS READ
# =========================================================

@router.put(
    "/{notification_id}/read",
    response_model=NotificationResponse
)
def read_notification(
    notification_id: int,
    creator_id: int,
    db: Session = Depends(get_db)
):
    notification = mark_notification_read(
        db,
        notification_id,
        creator_id
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification


# =========================================================
# DELETE NOTIFICATION
# =========================================================

@router.delete("/{notification_id}")
def remove_notification(
    notification_id: int,
    creator_id: int,
    db: Session = Depends(get_db)
):
    notification = delete_notification(
        db,
        notification_id,
        creator_id
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "message": "Notification deleted successfully"
    }