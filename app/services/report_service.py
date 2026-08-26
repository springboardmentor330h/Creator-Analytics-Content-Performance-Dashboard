from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.content import Content
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

    total_revenue = db.query(func.sum(Revenue.amount)).filter(Revenue.creator_id == creator_id).scalar() or 0.0
    total_sponsorship = db.query(func.sum(Sponsorship.amount)).filter(Sponsorship.creator_id == creator_id).scalar() or 0.0

    return {
        "creator": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email
        },
        "content_summary": {
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments
        },
        "revenue_summary": {
            "total_direct_revenue": total_revenue,
            "total_sponsorship_value": total_sponsorship,
            "combined_total": total_revenue + total_sponsorship
        }
    }