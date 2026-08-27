from decimal import Decimal

from sqlalchemy.orm import Session

from app.schemas.notification import NotificationCreate
from app.services.notification_service import create_notification


def create_performance_alert(
    db: Session,
    creator_id: int,
    metric: str,
    value: float,
    threshold: float,
):
    if value >= threshold:
        return create_notification(
            db,
            NotificationCreate(
                creator_id=creator_id,
                type="performance",
                title="Performance Alert",
                message=(
                    f"{metric} reached {value}, "
                    f"which is above the threshold of {threshold}."
                ),
            ),
        )

    return None


def create_engagement_notification(
    db: Session,
    creator_id: int,
    metric: str,
    value: float,
    threshold: float,
):
    if value >= threshold:
        return create_notification(
            db,
            NotificationCreate(
                creator_id=creator_id,
                type="engagement",
                title="Engagement Notification",
                message=(
                    f"{metric} reached {value}. "
                    "Your content is receiving strong engagement."
                ),
            ),
        )

    return None


def create_revenue_alert(
    db: Session,
    creator_id: int,
    revenue: Decimal,
    threshold: Decimal,
):
    if revenue >= threshold:
        return create_notification(
            db,
            NotificationCreate(
                creator_id=creator_id,
                type="revenue",
                title="Revenue Alert",
                message=(
                    f"Revenue reached {revenue}. "
                    f"The configured threshold is {threshold}."
                ),
            ),
        )

    return None