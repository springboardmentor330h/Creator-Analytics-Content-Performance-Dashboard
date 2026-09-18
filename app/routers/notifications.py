from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.creator import Creator
from app.models.notification import Notification
from app.models.revenue import Revenue
from app.models.sponsorship import Sponsorship
from app.models.user import User
from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
)
from app.services.analytics_service import kpi_summary
from app.services.revenue_service import summary as revenue_summary


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


def get_current_creator(
    current_user: User,
    db: Session,
) -> Creator:
    creator = (
        db.query(Creator)
        .filter(
            Creator.user_id == current_user.id
        )
        .first()
    )

    if not creator:
        raise HTTPException(
            status_code=404,
            detail="Creator profile not found for this user",
        )

    return creator


def get_legacy_notification_creator_id(
    creator: Creator,
    db: Session,
) -> int | None:
    """
    Resolve the legacy integer notification creator_id
    from the existing UUID mapping used by revenue and
    sponsorship records.

    No database schema change is required.
    """

    revenue_ids = {
        row.creator_id
        for row in (
            db.query(Revenue)
            .filter(
                Revenue.creator_uuid == creator.id,
                Revenue.creator_id.isnot(None),
            )
            .all()
        )
    }

    sponsorship_ids = {
        row.creator_id
        for row in (
            db.query(Sponsorship)
            .filter(
                Sponsorship.creator_uuid == creator.id,
                Sponsorship.creator_id.isnot(None),
            )
            .all()
        )
    }

    candidate_ids = revenue_ids | sponsorship_ids

    if len(candidate_ids) != 1:
        return None

    legacy_creator_id = next(iter(candidate_ids))

    if (
        revenue_ids
        and any(
            creator_id != legacy_creator_id
            for creator_id in revenue_ids
        )
    ):
        return None

    if (
        sponsorship_ids
        and any(
            creator_id != legacy_creator_id
            for creator_id in sponsorship_ids
        )
    ):
        return None

    return legacy_creator_id


@router.get("")
def list_notifications(
    current_user: User = Depends(get_current_user),
    unread_only: bool = False,
    db: Session = Depends(get_db),
):
    creator = get_current_creator(
        current_user,
        db,
    )

    legacy_creator_id = (
        get_legacy_notification_creator_id(
            creator,
            db,
        )
    )

    if legacy_creator_id is None:
        return []

    query = (
        db.query(Notification)
        .filter(
            Notification.creator_id
            == legacy_creator_id
        )
    )

    if unread_only:
        query = query.filter(
            Notification.is_read == False
        )

    return query.order_by(
        Notification.created_at.desc()
    ).all()


@router.get("/unread-count")
def unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    creator = get_current_creator(
        current_user,
        db,
    )

    legacy_creator_id = (
        get_legacy_notification_creator_id(
            creator,
            db,
        )
    )

    if legacy_creator_id is None:
        return {
            "unread_count": 0
        }

    count = (
        db.query(Notification)
        .filter(
            Notification.creator_id
            == legacy_creator_id,
            Notification.is_read == False,
        )
        .count()
    )

    return {
        "unread_count": count
    }


@router.put("/{notification_id}/read")
def mark_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    creator = get_current_creator(
        current_user,
        db,
    )

    legacy_creator_id = (
        get_legacy_notification_creator_id(
            creator,
            db,
        )
    )

    if legacy_creator_id is None:
        raise HTTPException(
            status_code=404,
            detail="Notification ownership mapping not found",
        )

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.creator_id
            == legacy_creator_id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


@router.put("/{notification_id}")
def update_notification(
    notification_id: int,
    data: NotificationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    creator = get_current_creator(
        current_user,
        db,
    )

    legacy_creator_id = (
        get_legacy_notification_creator_id(
            creator,
            db,
        )
    )

    if legacy_creator_id is None:
        raise HTTPException(
            status_code=404,
            detail="Notification ownership mapping not found",
        )

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.creator_id
            == legacy_creator_id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    for key, value in data.model_dump(
        exclude_unset=True
    ).items():
        setattr(
            notification,
            key,
            value,
        )

    db.commit()
    db.refresh(notification)

    return notification


@router.post("/generate")
def generate_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    creator = get_current_creator(
        current_user,
        db,
    )

    legacy_creator_id = (
        get_legacy_notification_creator_id(
            creator,
            db,
        )
    )

    if legacy_creator_id is None:
        raise HTTPException(
            status_code=409,
            detail=(
                "Notification generation is unavailable "
                "because the existing notification table "
                "uses a legacy integer creator_id without "
                "a valid ownership mapping."
            ),
        )

    kpis = kpi_summary(
        db,
        creator_id=creator.id,
    )

    revenue = revenue_summary(
        db,
        creator_id=legacy_creator_id,
    )

    created = []

    if kpis.get(
        "total_views",
        0,
    ) > 10000:

        notification = Notification(
            creator_id=legacy_creator_id,
            notification_type="performance",
            title="High views",
            message=(
                "Your content has crossed "
                "10,000 views."
            ),
            is_read=False,
        )

        db.add(notification)
        created.append(notification)

    if revenue.get(
        "total_revenue",
        0,
    ) > 0:

        notification = Notification(
            creator_id=legacy_creator_id,
            notification_type="revenue",
            title="Revenue update",
            message=(
                "Revenue activity is available "
                "in your dashboard."
            ),
            is_read=False,
        )

        db.add(notification)
        created.append(notification)

    db.commit()

    for notification in created:
        db.refresh(notification)

    return created