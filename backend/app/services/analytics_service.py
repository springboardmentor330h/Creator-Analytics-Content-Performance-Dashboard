from sqlalchemy.orm import Session
from app.models.content import Content


def calculate_engagement_rate(content: Content) -> float:
    """Engagement Rate = (Likes + Comments + Shares + Saves) / Reach * 100"""
    total_engagement = content.likes + content.comments + content.shares + content.saves
    if content.reach == 0:
        return 0.0
    return round((total_engagement / content.reach) * 100, 2)


def get_total_engagement(content: Content) -> int:
    return content.likes + content.comments + content.shares + content.saves


def get_content_engagement(db: Session, content_id: int):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        return None

    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views,
        "reach": content.reach,
        "total_engagement": get_total_engagement(content),
        "engagement_rate": calculate_engagement_rate(content),
    }


def get_top_performing_content(db: Session, limit: int = 5):
    all_content = db.query(Content).all()

    ranked = sorted(
        all_content,
        key=lambda c: calculate_engagement_rate(c),
        reverse=True,
    )

    top = ranked[:limit]

    return [
        {
            "content_id": c.id,
            "content_title": c.content_title,
            "platform": c.platform,
            "views": c.views,
            "reach": c.reach,
            "watch_time": c.watch_time,
            "engagement_rate": calculate_engagement_rate(c),
        }
        for c in top
    ]


def get_platform_performance(db: Session):
    all_content = db.query(Content).all()

    platforms: dict[str, list[Content]] = {}
    for c in all_content:
        platforms.setdefault(c.platform, []).append(c)

    result = []
    for platform, items in platforms.items():
        total_views = sum(i.views for i in items)
        total_likes = sum(i.likes for i in items)
        total_comments = sum(i.comments for i in items)
        total_reach = sum(i.reach for i in items)

        rates = [calculate_engagement_rate(i) for i in items]
        avg_engagement_rate = round(sum(rates) / len(rates), 2) if rates else 0.0

        result.append({
            "platform": platform,
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_reach": total_reach,
            "average_engagement_rate": avg_engagement_rate,
        })

    return result


def get_dashboard_summary(db: Session):
    all_content = db.query(Content).all()

    if not all_content:
        return {
            "total_content": 0,
            "total_views": 0,
            "total_reach": 0,
            "average_engagement_rate": 0.0,
            "best_platform": None,
            "top_content": None,
        }

    total_views = sum(c.views for c in all_content)
    total_reach = sum(c.reach for c in all_content)

    rates = [calculate_engagement_rate(c) for c in all_content]
    average_engagement_rate = round(sum(rates) / len(rates), 2)

    platform_stats = get_platform_performance(db)
    best_platform = max(platform_stats, key=lambda p: p["average_engagement_rate"])["platform"] if platform_stats else None

    top_content = max(all_content, key=lambda c: calculate_engagement_rate(c))

    return {
        "total_content": len(all_content),
        "total_views": total_views,
        "total_reach": total_reach,
        "average_engagement_rate": average_engagement_rate,
        "best_platform": best_platform,
        "top_content": top_content.content_title,
    }