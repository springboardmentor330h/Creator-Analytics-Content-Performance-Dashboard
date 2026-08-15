from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import Content
from app.models.audience import Audience
from app.models.revenue import RevenueRecord

router = APIRouter(prefix="/analytics-dashboard", tags=["analytics-dashboard"])


@router.get("/creator/{creator_id}")
def dashboard_overview(creator_id: int, db: Session = Depends(get_db)):
    content_items = db.query(Content).filter(Content.creator_id == creator_id).all()
    audience_items = db.query(Audience).filter(Audience.creator_id == creator_id).all()
    revenue_records = db.query(RevenueRecord).filter(RevenueRecord.creator_id == creator_id).all()

    total_views = sum(c.views for c in content_items)
    total_likes = sum(c.likes for c in content_items)
    total_comments = sum(c.comments for c in content_items)
    engagement_rate = (
        round(((total_likes + total_comments) / total_views) * 100, 2) if total_views > 0 else 0.0
    )
    top_content = max(content_items, key=lambda c: c.views, default=None)

    return {
        "content": {
            "total_items": len(content_items),
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "engagement_rate": engagement_rate,
            "top_content_title": top_content.content_title if top_content else None,
        },
        "audience": {
            "followers": sum(a.followers for a in audience_items),
            "impressions": sum(a.impressions for a in audience_items),
            "reach": sum(a.reach for a in audience_items),
        },
        "revenue": {
            "total_earnings": round(sum(r.amount for r in revenue_records), 2),
            "record_count": len(revenue_records),
        },
    }