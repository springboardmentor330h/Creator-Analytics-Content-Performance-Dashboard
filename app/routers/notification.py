from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user

from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
    NotificationReadResponse
)

from app.services.notification_service import (
    create_notification,
    get_all_notifications,
    get_unread_notifications,
    get_notification_by_id,
    mark_notification_as_read,
    mark_all_notifications_as_read
)

from app.services.revenue_service import get_creator_by_email


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.post(
    "",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_notification_api(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    return create_notification(
        db,
        notification_data,
        user.id
    )


@router.get(
    "",
    response_model=list[NotificationResponse]
)
def get_notifications_api(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    return get_all_notifications(
        db,
        user.id
    )


@router.get(
    "/unread",
    response_model=list[NotificationResponse]
)
def get_unread_notifications_api(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    return get_unread_notifications(
        db,
        user.id
    )


@router.get(
    "/{notification_id}",
    response_model=NotificationResponse
)
def get_notification_api(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    notification = get_notification_by_id(
        db,
        notification_id,
        user.id
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification


@router.put(
    "/{notification_id}/read",
    response_model=NotificationResponse
)
def mark_notification_read_api(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    notification = get_notification_by_id(
        db,
        notification_id,
        user.id
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return mark_notification_as_read(
        db,
        notification
    )


@router.put(
    "/read-all",
    response_model=NotificationReadResponse
)
def mark_all_notifications_read_api(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    count = mark_all_notifications_as_read(
        db,
        user.id
    )

    return {
        "message": f"{count} notification(s) marked as read"
    }