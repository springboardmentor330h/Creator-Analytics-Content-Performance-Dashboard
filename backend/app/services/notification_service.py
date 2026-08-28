from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from backend.app.models.notification import Notification
from backend.app.models.content import Content
from backend.app.models.revenue import Revenue
from backend.app.models.sponsorship import Sponsorship
from backend.app.models.audience import Audience
from backend.app.schemas.notification import NotificationCreate
from backend.app.services.analytics_service import AnalyticsService


class NotificationService:

    @staticmethod
    def get_notifications(
        db: Session,
        creator_id: int,
        unread_only: bool = False,
        type_filter: Optional[str] = None,
        limit: int = 50
    ) -> List[Notification]:
        query = db.query(Notification).filter(Notification.creator_id == creator_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        if type_filter and type_filter.lower() != "all":
            query = query.filter(Notification.type == type_filter.lower())
        
        return query.order_by(Notification.created_at.desc()).limit(limit).all()

    @staticmethod
    def get_unread_count(db: Session, creator_id: int) -> int:
        return db.query(Notification).filter(
            Notification.creator_id == creator_id,
            Notification.is_read == False
        ).count()

    @staticmethod
    def create_notification(
        db: Session,
        creator_id: int,
        notif_in: NotificationCreate
    ) -> Notification:
        notification = Notification(
            creator_id=creator_id,
            title=notif_in.title,
            message=notif_in.message,
            type=notif_in.type,
            severity=notif_in.severity,
            action_url=notif_in.action_url,
            is_read=False
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def mark_as_read(db: Session, creator_id: int, notification_id: int) -> Optional[Notification]:
        notif = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.creator_id == creator_id
        ).first()
        if notif:
            notif.is_read = True
            db.commit()
            db.refresh(notif)
        return notif

    @staticmethod
    def mark_all_as_read(db: Session, creator_id: int) -> int:
        count = db.query(Notification).filter(
            Notification.creator_id == creator_id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return count

    @staticmethod
    def delete_notification(db: Session, creator_id: int, notification_id: int) -> bool:
        notif = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.creator_id == creator_id
        ).first()
        if notif:
            db.delete(notif)
            db.commit()
            return True
        return False

    @staticmethod
    def generate_alerts(db: Session, creator_id: int) -> List[Notification]:
        """
        Analyzes real database metrics for the creator and auto-generates contextual
        performance, engagement, and revenue alerts.
        """
        created_alerts = []

        def add_if_distinct(title: str, message: str, notif_type: str, severity: str, action_url: str = None):
            existing = db.query(Notification).filter(
                Notification.creator_id == creator_id,
                Notification.title == title,
                Notification.message == message
            ).first()
            if not existing:
                notif = Notification(
                    creator_id=creator_id,
                    title=title,
                    message=message,
                    type=notif_type,
                    severity=severity,
                    action_url=action_url,
                    is_read=False
                )
                db.add(notif)
                created_alerts.append(notif)

        # 1. Performance Alerts
        contents = db.query(Content).filter(Content.creator_id == creator_id).all()
        if contents:
            top_content = max(contents, key=lambda c: c.views or 0)
            c_title = getattr(top_content, 'content_title', 'Content')
            if (top_content.views or 0) >= 1000:
                add_if_distinct(
                    title="🔥 Content Milestone Alert",
                    message=f"'{c_title}' reached {top_content.views:,} total views on {top_content.platform}!",
                    notif_type="performance",
                    severity="success",
                    action_url="#content"
                )

            total_views = sum(c.views or 0 for c in contents)
            if total_views > 5000:
                add_if_distinct(
                    title="📈 Total Views Landmark",
                    message=f"Congratulations! Your content portfolio crossed {total_views:,} views.",
                    notif_type="performance",
                    severity="info",
                    action_url="#summary"
                )

        # 2. Engagement Notifications
        if contents:
            content_rates = []
            for c in contents:
                rate = AnalyticsService.calculate_engagement_rate(
                    c.likes or 0, c.comments or 0, c.shares or 0, c.saves or 0, c.reach or 0
                )
                content_rates.append((c, rate))

            high_eng_items = [item for item in content_rates if item[1] >= 5.0]
            if high_eng_items:
                best_item, best_rate = max(high_eng_items, key=lambda x: x[1])
                b_title = getattr(best_item, 'content_title', 'Content')
                add_if_distinct(
                    title="⚡ High Engagement Detected",
                    message=f"'{b_title}' on {best_item.platform} achieved a stellar {best_rate}% engagement rate!",
                    notif_type="engagement",
                    severity="success",
                    action_url="#content"
                )

            low_eng_items = [item for item in content_rates if 0 < item[1] < 1.5]
            if low_eng_items:
                add_if_distinct(
                    title="⚠️ Engagement Warning",
                    message=f"{len(low_eng_items)} post(s) have an engagement rate below 1.5%. Consider updating tags or thumbnail design.",
                    notif_type="engagement",
                    severity="warning",
                    action_url="#content"
                )

        # 3. Revenue & Sponsorship Alerts
        revenues = db.query(Revenue).filter(Revenue.creator_id == creator_id).all()
        if revenues:
            total_revenue = sum(r.amount for r in revenues)
            if total_revenue >= 1000:
                add_if_distinct(
                    title="💰 Revenue Target Achieved",
                    message=f"Your cumulative recorded earnings have reached ${total_revenue:,.2f} USD!",
                    notif_type="revenue",
                    severity="success",
                    action_url="#revenue"
                )

            youtube_rev = sum(r.amount for r in revenues if r.source == "YouTube AdSense")
            if youtube_rev > 0:
                add_if_distinct(
                    title="📺 YouTube AdSense Update",
                    message=f"YouTube AdSense revenue tracked at ${youtube_rev:,.2f} USD.",
                    notif_type="revenue",
                    severity="info",
                    action_url="#revenue"
                )

        sponsorships = db.query(Sponsorship).filter(Sponsorship.creator_id == creator_id).all()
        if sponsorships:
            pending_payments = [s for s in sponsorships if s.payment_status in ["Pending", "Unpaid"]]
            if pending_payments:
                total_pending = sum(getattr(s, 'contract_value', 0.0) for s in pending_payments)
                add_if_distinct(
                    title="⏳ Pending Sponsorship Payment",
                    message=f"You have {len(pending_payments)} sponsorship deal(s) with pending payouts totaling ${total_pending:,.2f}.",
                    notif_type="revenue",
                    severity="alert",
                    action_url="#revenue"
                )

            active_deals = [s for s in sponsorships if s.status == "In Progress"]
            if active_deals:
                add_if_distinct(
                    title="🤝 Active Sponsorship Deal",
                    message=f"{len(active_deals)} brand deal campaign(s) are currently in progress.",
                    notif_type="revenue",
                    severity="info",
                    action_url="#revenue"
                )

        if created_alerts:
            db.commit()

        # Return latest alerts
        return db.query(Notification).filter(Notification.creator_id == creator_id).order_by(Notification.created_at.desc()).limit(20).all()
