from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.content import Content
from app.models.growth import Growth
from app.models.audience import Audience

def engagement_rate(c: Content) -> float:
    return round(((c.likes + c.comments + c.shares + c.saves) / c.reach * 100), 2) if c.reach else 0.0

def content_engagement(db: Session, content_id: int):
    c = db.query(Content).filter(Content.id == content_id).first()
    if not c:
        return None
    return {"content_id": c.id, "platform": c.platform, "views": c.views, "reach": c.reach,
            "total_engagement": c.likes+c.comments+c.shares+c.saves, "engagement_rate": engagement_rate(c)}

def top_content(db: Session, limit=5, platform=None):
    rows = db.query(Content).filter(Content.platform == platform).all() if platform else db.query(Content).all()
    rows.sort(key=engagement_rate, reverse=True)
    return [{"content_id": c.id, "content_title": c.content_title, "platform": c.platform,
             "views": c.views, "reach": c.reach, "watch_time": c.watch_time,
             "engagement_rate": engagement_rate(c)} for c in rows[:limit]]

def platform_performance(db: Session):
    groups=defaultdict(list)
    for c in db.query(Content).all(): groups[c.platform].append(c)
    result=[]
    for platform, rows in sorted(groups.items()):
        result.append({"platform":platform,"total_views":sum(x.views for x in rows),
                       "total_likes":sum(x.likes for x in rows),"total_comments":sum(x.comments for x in rows),
                       "total_reach":sum(x.reach for x in rows),
                       "average_engagement_rate":round(sum(engagement_rate(x) for x in rows)/len(rows),2)})
    return result

def summary(db: Session, platform=None):
    rows=db.query(Content).filter(Content.platform == platform).all() if platform else db.query(Content).all()
    rates=[engagement_rate(c) for c in rows]
    platforms=platform_performance(db)
    best=platform if platform and rows else (max(platforms,key=lambda x:x["average_engagement_rate"])["platform"] if platforms else None)
    top=top_content(db,1,platform)
    return {"total_content":len(rows),"total_views":sum(c.views for c in rows),"total_reach":sum(c.reach for c in rows),
            "average_engagement_rate":round(sum(rates)/len(rates),2) if rates else 0.0,
            "best_performing_platform":best,"top_content":top[0]["content_title"] if top else None}

def kpi_summary(db: Session, platform=None):
    rows=db.query(Content).filter(Content.platform == platform).all() if platform else db.query(Content).all(); aud=db.query(Audience).all()
    rates=[engagement_rate(c) for c in rows]
    return {"total_views":sum(c.views for c in rows),"total_likes":sum(c.likes for c in rows),
            "total_comments":sum(c.comments for c in rows),"total_shares":sum(c.shares for c in rows),
            "total_reach":sum(c.reach for c in rows),"total_followers":sum(a.followers for a in aud),
            "average_engagement_rate":round(sum(rates)/len(rates),2) if rates else 0.0}

def engagement_chart(db: Session, platform=None):
    base = db.query(Content).filter(Content.platform == platform).all() if platform else db.query(Content).all()
    rows=sorted([c for c in base if c.published_date], key=lambda c:c.published_date)
    return {"labels":[c.published_date.isoformat() for c in rows],"values":[engagement_rate(c) for c in rows]}

def follower_chart(db: Session):
    rows=db.query(Growth).order_by(Growth.date).all()
    return {"labels":[g.date.isoformat() for g in rows],"values":[g.followers for g in rows]}

def platform_comparison(db: Session):
    return {x["platform"]: {"views":x["total_views"],"reach":x["total_reach"],
            "engagement_rate":x["average_engagement_rate"],"likes":x["total_likes"],"comments":x["total_comments"]}
            for x in platform_performance(db)}
