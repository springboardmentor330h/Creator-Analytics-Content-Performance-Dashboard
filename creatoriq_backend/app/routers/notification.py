from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import cast

from app.db.database import get_db
from app.models.user import User
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
from app.core.auth import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


def _is_admin(current_user: User) -> bool:
    role = (current_user.role or "").strip().lower()
    return role in {"admin", "administrator"}


def _authorize_creator(
    creator_id: int,
    current_user: User,
):
    """
    Creators can access only their own notifications.
    Admins can access notifications for any creator.
    """

    current_user_id = cast(int, current_user.id)

    if not _is_admin(current_user) and current_user_id != creator_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this creator's notifications",
        )


# CREATE NOTIFICATION
@router.post(
    "",
    response_model=NotificationResponse,
    status_code=201,
)
def create_notification_api(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _authorize_creator(
        notification_data.creator_id,
        current_user,
    )

    return create_notification(
        db,
        notification_data,
    )


# GET ALL NOTIFICATIONS FOR CREATOR
@router.get(
    "/creator/{creator_id}",
    response_model=list[NotificationResponse],
)
def list_notifications_api(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _authorize_creator(
        creator_id,
        current_user,
    )

    return get_notifications(
        db,
        creator_id,
    )


# GET SINGLE NOTIFICATION
@router.get(
    "/{notification_id}",
    response_model=NotificationResponse,
)
def get_notification_api(
    notification_id: int,
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _authorize_creator(
        creator_id,
        current_user,
    )

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


# UPDATE NOTIFICATION
@router.put(
    "/{notification_id}",
    response_model=NotificationResponse,
)
def update_notification_api(
    notification_id: int,
    creator_id: int,
    notification_data: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _authorize_creator(
        creator_id,
        current_user,
    )

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


# MARK AS READ
@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_notification_read_api(
    notification_id: int,
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _authorize_creator(
        creator_id,
        current_user,
    )

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


# DELETE NOTIFICATION
@router.delete(
    "/{notification_id}",
)
def delete_notification_api(
    notification_id: int,
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _authorize_creator(
        creator_id,
        current_user,
    )

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

