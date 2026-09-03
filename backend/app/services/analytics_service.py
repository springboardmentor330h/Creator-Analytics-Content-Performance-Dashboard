from sqlalchemy.orm import Session
from app.models.content import Content
from collections import defaultdict
from app.models.growth import Growth

def calculate_engagement_rate(content: Content) -> float:
    reach = content.reach or 0
    if reach == 0:
        return 0.0
    shares = content.shares or 0
    total_engagement = content.likes + content.comments + shares
    return round((total_engagement / reach) * 100, 2)


def get_content_engagement(db: Session, content_id: int):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        return None
    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views or 0,
        "reach": content.reach or 0,
        "total_engagement": content.likes + content.comments + (content.shares or 0) + 0,
        "engagement_rate": calculate_engagement_rate(content),
    }


def get_top_performing_content(db: Session, limit: int = 5):
    all_content = db.query(Content).all()
    ranked = sorted(all_content, key=lambda c: calculate_engagement_rate(c), reverse=True)
    top = ranked[:limit]
    return [
        {
            "content_id": c.id,
            "content_title": c.content_title,
            "platform": c.platform,
            "views": c.views or 0,
            "reach": c.reach or 0,
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
        total_views = sum(i.views or 0 for i in items)
        total_likes = sum(i.likes for i in items)
        total_comments = sum(i.comments for i in items)
        total_reach = sum(i.reach or 0 for i in items)
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
            "total_content": 0, "total_views": 0, "total_reach": 0,
            "average_engagement_rate": 0.0, "best_platform": None, "top_content": None,
        }

    total_views = sum(c.views or 0 for c in all_content)
    total_reach = sum(c.reach or 0 for c in all_content)
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


def get_kpi_summary(db: Session):
    content_items = db.query(Content).all()
    total_views = sum(c.views or 0 for c in content_items)
    total_likes = sum(c.likes for c in content_items)
    total_comments = sum(c.comments for c in content_items)
    total_shares = sum(c.shares or 0 for c in content_items)
    total_reach = sum(c.reach or 0 for c in content_items)

    rates = [calculate_engagement_rate(c) for c in content_items]
    avg_rate = round(sum(rates) / len(rates), 2) if rates else 0.0

    growth_rows = db.query(Growth).order_by(Growth.creator_id, Growth.date.asc()).all()
    latest_per_creator = {}
    for g in growth_rows:
        latest_per_creator[g.creator_id] = g.followers
    total_followers = sum(latest_per_creator.values())

    return {
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_reach": total_reach,
        "total_followers": total_followers,
        "average_engagement_rate": avg_rate,
    }


def get_kpi_summary_filtered(db: Session, platform: str | None = None):
    query = db.query(Content)
    if platform and platform != "All":
        query = query.filter(Content.platform == platform)
    content_items = query.all()

    total_views = sum(c.views or 0 for c in content_items)
    total_likes = sum(c.likes for c in content_items)
    total_comments = sum(c.comments for c in content_items)
    total_shares = sum(c.shares or 0 for c in content_items)
    total_reach = sum(c.reach or 0 for c in content_items)

    rates = [calculate_engagement_rate(c) for c in content_items]
    avg_rate = round(sum(rates) / len(rates), 2) if rates else 0.0

    growth_rows = db.query(Growth).order_by(Growth.creator_id, Growth.date.asc()).all()
    latest_per_creator = {}
    for g in growth_rows:
        latest_per_creator[g.creator_id] = g.followers
    total_followers = sum(latest_per_creator.values()) if not platform or platform == "All" else None
    
    return {
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_reach": total_reach,
        "total_followers": total_followers,
        "average_engagement_rate": avg_rate,
        "content_count": len(content_items),
    }


def get_engagement_chart(db: Session):
    rows = db.query(Growth).order_by(Growth.date.asc()).all()
    daily = defaultdict(list)
    for r in rows:
        daily[r.date.isoformat()].append(r.engagement_rate)

    labels = sorted(daily.keys())
    values = [round(sum(daily[d]) / len(daily[d]), 2) for d in labels]
    return {"labels": labels, "values": values}


def get_followers_chart(db: Session):
    rows = db.query(Growth).order_by(Growth.date.asc()).all()
    daily = defaultdict(int)
    for r in rows:
        daily[r.date.isoformat()] += r.followers

    labels = sorted(daily.keys())
    values = [daily[d] for d in labels]
    return {"labels": labels, "values": values}


def get_platform_comparison(db: Session):
    content_items = db.query(Content).all()
    grouped: dict[str, list[Content]] = defaultdict(list)
    for c in content_items:
        grouped[c.platform].append(c)

    result = {}
    for platform, items in grouped.items():
        rates = [calculate_engagement_rate(c) for c in items]
        result[platform] = {
            "views": sum(i.views or 0 for i in items),
            "reach": sum(i.reach or 0 for i in items),
            "likes": sum(i.likes for i in items),
            "comments": sum(i.comments for i in items),
            "engagement_rate": round(sum(rates) / len(rates), 2) if rates else 0.0,
        }
    return result