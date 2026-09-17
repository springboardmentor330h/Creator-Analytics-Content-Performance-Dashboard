from sqlalchemy.orm import Session
from app.models.content import Content
from app.models.audience import Audience
from app.models.growth import Growth


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


def get_content_engagement(db: Session, content_id: int, creator_id: int):
    """Task 1: engagement details for a single content item, scoped to the requesting creator."""
    content = db.query(Content).filter(
        Content.id == content_id, Content.creator_id == creator_id
    ).first()
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


def get_top_content(db: Session, creator_id: int, limit: int = 5):
    """Task 2: top-performing content ranked by engagement rate, scoped to the creator."""
    all_content = db.query(Content).filter(Content.creator_id == creator_id).all()

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


def get_platform_comparison(db: Session, creator_id: int) -> dict:
    all_content = db.query(Content).filter(
        Content.creator_id == creator_id
    ).order_by(Content.published_date.asc()).all()

    platforms = {}
    for c in all_content:
        if c.platform not in platforms:
            platforms[c.platform] = {
                "views": 0,
                "reach": 0,
                "likes": 0,
                "comments": 0,
                "engagement_rates": [],
                "dated_rates": []  # (date, engagement_rate) pairs, used to compute growth
            }
        platforms[c.platform]["views"] += c.views
        platforms[c.platform]["reach"] += c.reach
        platforms[c.platform]["likes"] += c.likes
        platforms[c.platform]["comments"] += c.comments

        rate = calculate_engagement(c)["engagement_rate"]
        platforms[c.platform]["engagement_rates"].append(rate)
        platforms[c.platform]["dated_rates"].append((c.published_date, rate))

    result = {}
    for platform, data in platforms.items():
        rates = data.pop("engagement_rates")
        avg_rate = round(sum(rates) / len(rates), 2) if rates else 0.0
        data["engagement_rate"] = avg_rate

        # Growth: compare average engagement rate in the earlier half of this
        # platform's content vs. the later half, since per-platform follower
        # growth isn't tracked in our data model. This is a content-engagement
        # growth signal, not follower growth.
        dated_rates = sorted(data.pop("dated_rates"), key=lambda x: x[0])
        n = len(dated_rates)

        if n < 2:
            growth_rate = 0.0
        else:
            mid = n // 2
            first_half = [r for _, r in dated_rates[:mid]]
            second_half = [r for _, r in dated_rates[mid:]]
            first_avg = sum(first_half) / len(first_half) if first_half else 0
            second_avg = sum(second_half) / len(second_half) if second_half else 0

            if first_avg == 0:
                growth_rate = 0.0
            else:
                growth_rate = round(((second_avg - first_avg) / first_avg) * 100, 2)

        data["growth_rate"] = growth_rate
        result[platform] = data

    return result


def get_dashboard_summary(db: Session, creator_id: int):
    """Task 4: overall dashboard summary, scoped to the creator."""
    all_content = db.query(Content).filter(Content.creator_id == creator_id).all()

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

    platform_stats = get_platform_comparison(db, creator_id)
    best_platform = max(platform_stats, key=lambda p: platform_stats[p]["engagement_rate"]) if platform_stats else None

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


def get_kpi_summary(db: Session, creator_id: int, platform: str | None = None) -> dict:
    query = db.query(Content).filter(Content.creator_id == creator_id)
    if platform:
        query = query.filter(Content.platform == platform)
    all_content = query.all()

    all_audience = db.query(Audience).filter(Audience.creator_id == creator_id).all()

    total_views = sum(c.views for c in all_content)
    total_likes = sum(c.likes for c in all_content)
    total_comments = sum(c.comments for c in all_content)
    total_shares = sum(c.shares for c in all_content)
    total_reach = sum(c.reach for c in all_content)
    total_followers = sum(a.followers for a in all_audience)

    if all_content:
        engagement_rates = [calculate_engagement(c)["engagement_rate"] for c in all_content]
        average_engagement_rate = round(sum(engagement_rates) / len(engagement_rates), 2)
    else:
        average_engagement_rate = 0.0

    return {
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_reach": total_reach,
        "total_followers": total_followers,
        "average_engagement_rate": average_engagement_rate
    }


def get_engagement_chart(db: Session, creator_id: int, platform: str | None = None) -> dict:
    query = db.query(Content).filter(Content.creator_id == creator_id)
    if platform:
        query = query.filter(Content.platform == platform)
    all_content = query.order_by(Content.published_date.asc()).all()

    daily_rates = {}
    for c in all_content:
        rate = calculate_engagement(c)["engagement_rate"]
        daily_rates.setdefault(c.published_date, []).append(rate)

    sorted_dates = sorted(daily_rates.keys())
    labels = [str(d) for d in sorted_dates]
    values = [round(sum(daily_rates[d]) / len(daily_rates[d]), 2) for d in sorted_dates]

    return {"labels": labels, "values": values}


# ----- Content Growth Tracking (distinct from follower growth) -----
def get_content_growth(db: Session, creator_id: int, start_date=None, end_date=None) -> dict:
    """
    Tracks the VOLUME of content published over time (how many pieces of
    content per day), as opposed to get_followers_chart which tracks audience
    size. Also returns a running cumulative total, useful for a "total content
    over time" growth line.
    """
    query = db.query(Content).filter(Content.creator_id == creator_id)
    if start_date:
        query = query.filter(Content.published_date >= start_date)
    if end_date:
        query = query.filter(Content.published_date <= end_date)
    all_content = query.order_by(Content.published_date.asc()).all()

    daily_counts = {}
    for c in all_content:
        daily_counts[c.published_date] = daily_counts.get(c.published_date, 0) + 1

    sorted_dates = sorted(daily_counts.keys())
    labels = [str(d) for d in sorted_dates]
    daily_values = [daily_counts[d] for d in sorted_dates]

    cumulative = []
    running_total = 0
    for v in daily_values:
        running_total += v
        cumulative.append(running_total)

    return {
        "labels": labels,
        "daily_content_count": daily_values,
        "cumulative_content_count": cumulative,
        "total_content": running_total
    }


def get_followers_chart(db: Session, creator_id: int) -> dict:
    all_records = db.query(Growth).filter(
        Growth.creator_id == creator_id
    ).order_by(Growth.date.asc()).all()

    daily_totals = {}
    for r in all_records:
        daily_totals[r.date] = daily_totals.get(r.date, 0) + r.followers

    sorted_dates = sorted(daily_totals.keys())
    labels = [str(d) for d in sorted_dates]
    values = [daily_totals[d] for d in sorted_dates]

    return {"labels": labels, "values": values}
