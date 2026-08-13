from sqlalchemy.orm import Session
from app.models.content import Content


def calculate_engagement(content: Content) -> dict:
    """Returns total_engagement and engagement_rate for a single content item."""
    total_engagement = content.likes + content.comments + content.shares + content.saves

    if content.reach == 0:
        engagement_rate = 0.0
    else:
        engagement_rate = round((total_engagement / content.reach) * 100, 2)

    return {
        "total_engagement": total_engagement,
        "engagement_rate": engagement_rate
    }


def get_content_engagement(db: Session, content_id: int):
    """Task 1: engagement details for a single content item."""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        return None

    metrics = calculate_engagement(content)

    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views,
        "reach": content.reach,
        "total_engagement": metrics["total_engagement"],
        "engagement_rate": metrics["engagement_rate"]
    }


def get_top_content(db: Session, limit: int = 5):
    """Task 2: top-performing content ranked by engagement rate."""
    all_content = db.query(Content).all()

    ranked = []
    for content in all_content:
        metrics = calculate_engagement(content)
        ranked.append({
            "content_title": content.content_title,
            "platform": content.platform,
            "views": content.views,
            "reach": content.reach,
            "watch_time": content.watch_time,
            "engagement_rate": metrics["engagement_rate"]
        })

    ranked.sort(key=lambda c: c["engagement_rate"], reverse=True)
    return ranked[:limit]


def get_platform_performance(db: Session):
    """Task 3: aggregated performance metrics grouped by platform."""
    all_content = db.query(Content).all()

    platforms = {}

    for content in all_content:
        metrics = calculate_engagement(content)
        platform = content.platform

        if platform not in platforms:
            platforms[platform] = {
                "platform": platform,
                "total_views": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_reach": 0,
                "engagement_rates": []
            }

        platforms[platform]["total_views"] += content.views
        platforms[platform]["total_likes"] += content.likes
        platforms[platform]["total_comments"] += content.comments
        platforms[platform]["total_reach"] += content.reach
        platforms[platform]["engagement_rates"].append(metrics["engagement_rate"])

    result = []
    for platform_data in platforms.values():
        rates = platform_data.pop("engagement_rates")
        avg_rate = round(sum(rates) / len(rates), 2) if rates else 0.0
        platform_data["average_engagement_rate"] = avg_rate
        result.append(platform_data)

    return result


def get_dashboard_summary(db: Session):
    """Task 4: overall dashboard summary."""
    all_content = db.query(Content).all()

    if not all_content:
        return {
            "total_content": 0,
            "total_views": 0,
            "total_reach": 0,
            "average_engagement_rate": 0.0,
            "best_platform": None,
            "top_content": None
        }

    total_content = len(all_content)
    total_views = sum(c.views for c in all_content)
    total_reach = sum(c.reach for c in all_content)

    engagement_rates = [calculate_engagement(c)["engagement_rate"] for c in all_content]
    average_engagement_rate = round(sum(engagement_rates) / total_content, 2)

    # Best-performing platform = highest average engagement rate
    platform_stats = get_platform_performance(db)
    best_platform = max(platform_stats, key=lambda p: p["average_engagement_rate"])["platform"] if platform_stats else None

    # Top content = highest single engagement rate
    top = max(all_content, key=lambda c: calculate_engagement(c)["engagement_rate"])
    top_content_title = top.content_title

    return {
        "total_content": total_content,
        "total_views": total_views,
        "total_reach": total_reach,
        "average_engagement_rate": average_engagement_rate,
        "best_platform": best_platform,
        "top_content": top_content_title
    }