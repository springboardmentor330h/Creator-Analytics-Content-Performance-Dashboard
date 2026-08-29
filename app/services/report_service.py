from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.audience import AudienceDemographics
from app.models.content import Content
from app.models.growth import ContentGrowth
from app.models.revenue import Revenue
from app.models.sponsorship import Sponsorship
from app.models.user import User
from fastapi import HTTPException


def get_comprehensive_creator_report(creator_id: int, db: Session) -> dict:
    user = db.query(User).filter(User.id == creator_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Creator with id {creator_id} not found")

    total_views = db.query(func.sum(Content.views)).filter(Content.creator_id == creator_id).scalar() or 0
    total_likes = db.query(func.sum(Content.likes)).filter(Content.creator_id == creator_id).scalar() or 0
    total_comments = db.query(func.sum(Content.comments)).filter(Content.creator_id == creator_id).scalar() or 0
    total_shares = db.query(func.sum(Content.shares)).filter(Content.creator_id == creator_id).scalar() or 0
    total_posts = db.query(func.count(Content.id)).filter(Content.creator_id == creator_id).scalar() or 0

    total_revenue = db.query(func.sum(Revenue.amount)).filter(Revenue.creator_id == creator_id).scalar() or 0.0
    total_sponsorship = db.query(func.sum(Sponsorship.amount)).filter(Sponsorship.creator_id == creator_id).scalar() or 0.0

    audience_rows = (
        db.query(AudienceDemographics)
        .filter(AudienceDemographics.creator_id == creator_id)
        .order_by(AudienceDemographics.id.asc())
        .all()
    )

    growth_rows = (
        db.query(ContentGrowth)
        .filter(ContentGrowth.creator_id == creator_id)
        .order_by(ContentGrowth.date.asc())
        .all()
    )

    return {
        "creator": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        },
        "content_summary": {
            "total_posts": total_posts,
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_shares": total_shares,
        },
        "revenue_summary": {
            "total_direct_revenue": total_revenue,
            "total_sponsorship_value": total_sponsorship,
            "combined_total": total_revenue + total_sponsorship,
        },
        "audience_demographics": [
            {
                "id": row.id,
                "creator_id": row.creator_id,
                "country": row.country,
                "age_group": row.age_group,
                "gender": row.gender,
                "percentage": row.percentage,
            }
            for row in audience_rows
        ],
        "growth_trends": [
            {
                "id": row.id,
                "creator_id": row.creator_id,
                "recorded_date": row.date.isoformat() if row.date else None,
                "follower_count": row.followers,
                "engagement_rate": row.engagement_rate,
            }
            for row in growth_rows
        ],
    }