from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.content import Content
from app.models.user import User
from app.services.content_service import _apply_scope, can_view_content

def calculate_item_engagement_rate(item: Content) -> float:
    total_eng = item.likes + item.comments + item.shares + item.saves
    if item.reach > 0:
        return (total_eng / item.reach) * 100.0
    return 0.0

def get_content_engagement(db: Session, user: User, content_id: int) -> Optional[Dict[str, Any]]:
    content = db.get(Content, content_id)
    if not content or not can_view_content(user, content):
        return None
    
    total_engagement = content.likes + content.comments + content.shares + content.saves
    engagement_rate = calculate_item_engagement_rate(content)
        
    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views,
        "reach": content.reach,
        "total_engagement": total_engagement,
        "engagement_rate": round(engagement_rate, 2)
    }

def get_top_content(db: Session, user: User) -> List[Dict[str, Any]]:
    stmt = _apply_scope(select(Content), user)
    records = db.scalars(stmt).all()
    
    results = []
    for item in records:
        eng_rate = calculate_item_engagement_rate(item)
        results.append({
            "content_title": item.title,
            "platform": item.platform,
            "views": item.views,
            "reach": item.reach,
            "watch_time": item.watch_time,
            "engagement_rate": round(eng_rate, 2)
        })
        
    results.sort(key=lambda x: x["engagement_rate"], reverse=True)
    return results[:5]

def get_platform_performance(db: Session, user: User) -> List[Dict[str, Any]]:
    stmt = _apply_scope(select(Content), user)
    records = db.scalars(stmt).all()
    
    platforms = {}
    for item in records:
        p = item.platform
        if p not in platforms:
            platforms[p] = {
                "total_views": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_reach": 0,
                "sum_eng_rate": 0.0,
                "count": 0
            }
        
        platforms[p]["total_views"] += item.views
        platforms[p]["total_likes"] += item.likes
        platforms[p]["total_comments"] += item.comments
        platforms[p]["total_reach"] += item.reach
        
        eng_rate = calculate_item_engagement_rate(item)
        platforms[p]["sum_eng_rate"] += eng_rate
        platforms[p]["count"] += 1
        
    results = []
    for p, data in platforms.items():
        avg_eng = data["sum_eng_rate"] / data["count"] if data["count"] > 0 else 0.0
        results.append({
            "platform": p,
            "total_views": data["total_views"],
            "total_likes": data["total_likes"],
            "total_comments": data["total_comments"],
            "total_reach": data["total_reach"],
            "average_engagement_rate": round(avg_eng, 2)
        })
    return results

def get_dashboard_summary(db: Session, user: User) -> Dict[str, Any]:
    stmt = _apply_scope(select(Content), user)
    records = db.scalars(stmt).all()
    
    total_content = len(records)
    total_views = 0
    total_reach = 0
    sum_eng_rate = 0.0
    
    platform_eng = {}
    top_content_title = ""
    max_eng_rate = -1.0
    
    for item in records:
        total_views += item.views
        total_reach += item.reach
        
        eng_rate = calculate_item_engagement_rate(item)
        sum_eng_rate += eng_rate
        
        p = item.platform
        if p not in platform_eng:
            platform_eng[p] = {"sum": 0.0, "count": 0}
        platform_eng[p]["sum"] += eng_rate
        platform_eng[p]["count"] += 1
        
        if eng_rate > max_eng_rate:
            max_eng_rate = eng_rate
            top_content_title = item.title

    avg_eng_rate = (sum_eng_rate / total_content) if total_content > 0 else 0.0
    
    best_platform = ""
    best_platform_avg = -1.0
    for p, data in platform_eng.items():
        avg = data["sum"] / data["count"]
        if avg > best_platform_avg:
            best_platform_avg = avg
            best_platform = p
            
    return {
        "total_content": total_content,
        "total_views": total_views,
        "total_reach": total_reach,
        "average_engagement_rate": round(avg_eng_rate, 2),
        "best_platform": best_platform,
        "top_content": top_content_title
    }
