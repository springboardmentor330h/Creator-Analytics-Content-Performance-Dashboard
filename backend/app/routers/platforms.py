from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from backend.app.db.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.content import Content
from backend.app.services.social_media import SocialMediaService
from backend.app.services.youtube_service import YouTubeService
from backend.app.services.instagram_service import InstagramService
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/social/platforms", tags=["Social Platforms"])

@router.get("", response_model=List[str])
def get_connected_platforms():
    """List all connected social media platforms."""
    return SocialMediaService.get_connected_platforms()

@router.post("/connect")
def connect_platform(
    platform: str = Query(..., description="Platform name e.g. Instagram, TikTok, LinkedIn, X"),
    account_name: str = Query(..., description="Creator handle or account name"),
    current_user: User = Depends(get_current_user)
):
    """Connect a new social media platform account for creator."""
    res = SocialMediaService.connect_account(platform, account_name)
    return res

@router.post("/{platform}/sync")
def sync_platform_data(
    platform: str,
    account_id: Optional[str] = Query(None, description="Platform channel ID or handle"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Synchronize content and engagement data from YouTube, Instagram, TikTok, LinkedIn, or X.
    Extracts metrics, transforms to CreatorIQ Common Format, and updates PostgreSQL database.
    """
    p_lower = platform.strip().lower()
    
    if p_lower == "youtube":
        res = YouTubeService.sync_youtube_videos(db, creator_id=current_user.id, channel_id=account_id)
        return res
    elif p_lower == "instagram":
        res = InstagramService.sync_instagram_media(db, creator_id=current_user.id, instagram_handle=account_id)
        return res
    else:
        # Use SocialMediaService omnichannel sync for TikTok, LinkedIn, X, Facebook
        res = SocialMediaService.sync_platform_data(db, platform=platform.capitalize(), creator_id=current_user.id)
        return res

@router.get("/comparison")
def get_platform_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch comprehensive cross-platform comparative metrics comparing YouTube, Instagram, TikTok, LinkedIn, and X.
    Returns side-by-side performance indicators (Views, Likes, Comments, Engagement Rate, Reach, Follower Share).
    """
    contents = db.query(Content).filter(Content.creator_id == current_user.id).all()
    if not contents:
        contents = db.query(Content).all()

    platform_map: Dict[str, Dict[str, Any]] = {}
    default_platforms = ["YouTube", "Instagram", "TikTok", "LinkedIn", "X"]

    for p in default_platforms:
        platform_map[p] = {
            "platform": p,
            "views": 0,
            "likes": 0,
            "comments": 0,
            "shares": 0,
            "reach": 0,
            "rates": [],
            "content_count": 0
        }

    for item in contents:
        p = item.platform
        if p not in platform_map:
            platform_map[p] = {
                "platform": p,
                "views": 0,
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "reach": 0,
                "rates": [],
                "content_count": 0
            }
        platform_map[p]["views"] += (item.views or 0)
        platform_map[p]["likes"] += (item.likes or 0)
        platform_map[p]["comments"] += (item.comments or 0)
        platform_map[p]["shares"] += (item.shares or 0)
        platform_map[p]["reach"] += (item.reach or 0)
        platform_map[p]["content_count"] += 1

        rate = AnalyticsService.calculate_engagement_rate(
            item.likes or 0, item.comments or 0, item.shares or 0, item.saves or 0, item.reach or 0
        )
        platform_map[p]["rates"].append(rate)

    tot_views_all = sum(d["views"] for d in platform_map.values())
    comparison = []

    for p, d in platform_map.items():
        avg_rate = round(sum(d["rates"]) / len(d["rates"]), 2) if d["rates"] else 5.2
        view_share = round((d["views"] / tot_views_all * 100.0), 1) if tot_views_all > 0 else 20.0
        comparison.append({
            "platform": p,
            "total_views": d["views"],
            "total_likes": d["likes"],
            "total_comments": d["comments"],
            "total_shares": d["shares"],
            "total_reach": d["reach"],
            "average_engagement_rate": avg_rate,
            "view_share_percentage": view_share,
            "content_count": d["content_count"]
        })

    comparison.sort(key=lambda x: x["total_views"], reverse=True)

    return {
        "creator_id": current_user.id,
        "total_platforms_tracked": len(comparison),
        "comparison": comparison
    }
