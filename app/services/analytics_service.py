from sqlalchemy.orm import Session

from app.models.content import Content



def get_engagement_data(db: Session, content_id: int):
    content = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not content:
        return None

    return {
        "content_id": content.id,
        "likes": content.likes,
        "comments": content.comments,
        "shares": content.shares,
        "saves": content.saves,
        "engagement_rate": content.engagement_rate
    }

def compare_content(db: Session, content_ids: list[int]):
    contents = (
        db.query(Content)
        .filter(Content.id.in_(content_ids))
        .all()
    )

    comparison_data = []

    for content in contents:
        comparison_data.append({
            "content_id": content.id,
            "title": content.title,
            "platform": content.platform,
            "views": content.views,
            "likes": content.likes,
            "comments": content.comments,
            "shares": content.shares,
            "saves": content.saves,
            "watch_time": content.watch_time,
            "reach": content.reach,
            "engagement_rate": content.engagement_rate
        })

    return comparison_data

def get_top_performing_content(
    db: Session,
    limit: int = 5
):
    contents = (
        db.query(Content)
        .order_by(Content.engagement_rate.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "content_id": content.id,
            "title": content.title,
            "platform": content.platform,
            "views": content.views,
            "likes": content.likes,
            "comments": content.comments,
            "shares": content.shares,
            "saves": content.saves,
            "reach": content.reach,
            "engagement_rate": content.engagement_rate
        }
        for content in contents
    ]

def get_reach_analysis(
    db: Session,
    limit: int = 5
):
    contents = (
        db.query(Content)
        .order_by(Content.reach.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "content_id": content.id,
            "title": content.title,
            "platform": content.platform,
            "reach": content.reach
        }
        for content in contents
    ]

def get_performance_trends(
    db: Session,
    limit: int = 10
):
    contents = (
        db.query(Content)
        .order_by(Content.id.asc())
        .limit(limit)
        .all()
    )

    return [
        {
            "content_id": content.id,
            "title": content.title,
            "platform": content.platform,
            "views": content.views,
            "likes": content.likes,
            "comments": content.comments,
            "shares": content.shares,
            "saves": content.saves,
            "reach": content.reach,
            "engagement_rate": content.engagement_rate
        }
        for content in contents
    ]