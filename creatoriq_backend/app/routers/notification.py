from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
    NotificationUpdate,
)
from app.services.notification_service import (
    create_notification,
    delete_notification,
    get_notification,
    get_notifications,
    mark_notification_as_read,
    update_notification,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.post(
    "",
    response_model=NotificationResponse,
    status_code=201,
)
def create_notification_api(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
):
    return create_notification(
        db,
        notification_data,
    )


@router.get(
    "/creator/{creator_id}",
    response_model=list[NotificationResponse],
)
def list_notifications_api(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return get_notifications(
        db,
        creator_id,
    )


@router.get(
    "/{notification_id}",
    response_model=NotificationResponse,
)
def get_notification_api(
    notification_id: int,
    creator_id: int,
    db: Session = Depends(get_db),
):
    notification = get_notification(
        db,
        notification_id,
        creator_id,
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return notification


@router.put(
    "/{notification_id}",
    response_model=NotificationResponse,
)
def update_notification_api(
    notification_id: int,
    creator_id: int,
    notification_data: NotificationUpdate,
    db: Session = Depends(get_db),
):
    notification = get_notification(
        db,
        notification_id,
        creator_id,
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return update_notification(
        db,
        notification,
        notification_data,
    )


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_notification_read_api(
    notification_id: int,
    creator_id: int,
    db: Session = Depends(get_db),
):
    notification = get_notification(
        db,
        notification_id,
        creator_id,
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return mark_notification_as_read(
        db,
        notification,
    )


@router.delete(
    "/{notification_id}",
)
def delete_notification_api(
    notification_id: int,
    creator_id: int,
    db: Session = Depends(get_db),
):
    notification = get_notification(
        db,
        notification_id,
        creator_id,
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    delete_notification(
        db,
        notification,
    )

    return {
        "message": "Notification deleted successfully",
    }