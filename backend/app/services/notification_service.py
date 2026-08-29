"""
notification_service.py

Generates alerts by reading from the EXISTING analytics and revenue
services — no duplicate analytics logic here, just threshold checks
that turn existing data into notifications.
"""

from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.services import analytics_service, revenue_service

# Thresholds — adjust as needed
HIGH_ENGAGEMENT_THRESHOLD = 10.0     # % engagement rate considered "performing well"
LOW_ENGAGEMENT_THRESHOLD = 1.0       # % engagement rate considered "underperforming"
LOW_ENGAGEMENT_MIN_VIEWS = 1000      # only flag low engagement if it actually has reach
REVENUE_DROP_THRESHOLD = -20.0       # % month-over-month drop that triggers an alert


def _create_notification(db: Session, creator_id: int, type_: str, title: str, message: str) -> Notification:
    notification = Notification(
        creator_id=creator_id,
        type=type_,
        title=title,
        message=message,
        is_read=False,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def check_performance_alerts(db: Session, creator_id: int) -> List[Notification]:
    """High-engagement content gets flagged as a performance win."""
    created = []
    for item in analytics_service.get_top_content(db, limit=10):
        if item["engagement_rate"] >= HIGH_ENGAGEMENT_THRESHOLD:
            created.append(_create_notification(
                db, creator_id, "performance",
                "High-performing content",
                f"\"{item['content_title']}\" on {item['platform']} is performing well "
                f"with {item['engagement_rate']}% engagement.",
            ))
    return created


def check_engagement_alerts(db: Session, creator_id: int) -> List[Notification]:
    """High-view but low-engagement content gets flagged for attention."""
    created = []
    for item in analytics_service.get_top_content(db, limit=50):
        if item["views"] >= LOW_ENGAGEMENT_MIN_VIEWS and item["engagement_rate"] <= LOW_ENGAGEMENT_THRESHOLD:
            created.append(_create_notification(
                db, creator_id, "engagement",
                "Low engagement detected",
                f"\"{item['content_title']}\" on {item['platform']} has {item['views']} views "
                f"but only {item['engagement_rate']}% engagement.",
            ))
    return created


def check_revenue_alerts(db: Session, creator_id: int) -> List[Notification]:
    """Flags a significant month-over-month revenue drop."""
    created = []
    trend = revenue_service.get_revenue_trend(db, creator_id)
    if trend:
        latest = trend[-1]
        if latest["change_percentage"] <= REVENUE_DROP_THRESHOLD:
            created.append(_create_notification(
                db, creator_id, "revenue",
                "Revenue drop alert",
                f"Revenue dropped {abs(latest['change_percentage'])}% in {latest['month']} "
                f"compared to the previous month.",
            ))
    return created


def run_all_alert_checks(db: Session, creator_id: int) -> Dict[str, Any]:
    """Runs every alert check and returns a summary of what was created."""
    performance = check_performance_alerts(db, creator_id)
    engagement = check_engagement_alerts(db, creator_id)
    revenue = check_revenue_alerts(db, creator_id)

    return {
        "performance_alerts_created": len(performance),
        "engagement_alerts_created": len(engagement),
        "revenue_alerts_created": len(revenue),
        "total_alerts_created": len(performance) + len(engagement) + len(revenue),
    }