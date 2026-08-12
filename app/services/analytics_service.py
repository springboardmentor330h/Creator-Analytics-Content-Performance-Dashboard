from sqlalchemy.orm import Session

from app.models.content import Content



# def get_engagement_data(db: Session, content_id: int):
#     content = (
#         db.query(Content)
#         .filter(Content.id == content_id)
#         .first()
#     )

#     if not content:
#         return None

#     return {
#         "content_id": content.id,
#         "likes": content.likes,
#         "comments": content.comments,
#         "shares": content.shares,
#         "saves": content.saves,
#         "engagement_rate": content.engagement_rate
#     }
def get_engagement_data(db: Session, content_id: int):
    content = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not content:
        return None

    total_engagement = (
        content.likes
        + content.comments
        + content.shares
        + content.saves
    )

    if content.reach > 0:
        engagement_rate = (
            total_engagement / content.reach
        ) * 100
    else:
        engagement_rate = 0

    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views,
        "reach": content.reach,
        "total_engagement": total_engagement,
        "engagement_rate": round(engagement_rate, 2)
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
            "title":content.content_title,
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
            "title": content.content_title,
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
            "title":content.content_title ,
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
            "title": content.content_title,
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

def get_top_content(
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
            "title": content.content_title,
            "platform": content.platform,
            "views": content.views,
            "reach": content.reach,
            "watch_time": content.watch_time,
            "engagement_rate": content.engagement_rate
        }
        for content in contents
    ]

def get_platform_performance(db: Session):
    contents = db.query(Content).all()

    platform_data = {}

    for content in contents:
        platform = content.platform

        if platform not in platform_data:
            platform_data[platform] = {
                "total_views": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_reach": 0,
                "engagement_rates": []
            }

        platform_data[platform]["total_views"] += content.views
        platform_data[platform]["total_likes"] += content.likes
        platform_data[platform]["total_comments"] += content.comments
        platform_data[platform]["total_reach"] += content.reach
        platform_data[platform]["engagement_rates"].append(
            content.engagement_rate
        )

    result = []

    for platform, data in platform_data.items():
        if data["engagement_rates"]:
            average_engagement_rate = (
                sum(data["engagement_rates"])
                / len(data["engagement_rates"])
            )
        else:
            average_engagement_rate = 0

        result.append({
            "platform": platform,
            "total_views": data["total_views"],
            "total_likes": data["total_likes"],
            "total_comments": data["total_comments"],
            "total_reach": data["total_reach"],
            "average_engagement_rate": round(
                average_engagement_rate, 2
            )
        })

    return result

def get_dashboard_summary(db: Session):
    contents = db.query(Content).all()

    if not contents:
        return {
            "total_content": 0,
            "total_views": 0,
            "total_reach": 0,
            "average_engagement_rate": 0,
            "best_platform": "",
            "top_content": ""
        }

    total_content = len(contents)

    total_views = sum(content.views for content in contents)

    total_reach = sum(content.reach for content in contents)

    average_engagement_rate = (
        sum(content.engagement_rate for content in contents)
        / total_content
    )

    platform_performance = get_platform_performance(db)

    best_platform_data = max(
        platform_performance,
        key=lambda platform: platform["average_engagement_rate"]
    )

    top_content_data = max(
        contents,
        key=lambda content: content.engagement_rate
    )

    return {
        "total_content": total_content,
        "total_views": total_views,
        "total_reach": total_reach,
        "average_engagement_rate": round(
            average_engagement_rate, 2
        ),
        "best_platform": best_platform_data["platform"],
        "top_content": top_content_data.content_title
    }