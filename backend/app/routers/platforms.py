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

from backend.app.models.social_account import SocialAccount

router = APIRouter(prefix="/social/platforms", tags=["Social Platforms"])

@router.get("", response_model=List[str])
def get_connected_platforms():
    """List all connected social media platforms."""
    return SocialMediaService.get_connected_platforms()

@router.get("/saved-accounts")
def get_saved_accounts(
    platform: Optional[str] = Query(None, description="Optional platform filter e.g. YouTube, Instagram"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all saved social channels & handles for the current creator.
    Supports filtering by platform.
    """
    query = db.query(SocialAccount).filter(
        SocialAccount.creator_id == current_user.id,
        SocialAccount.is_active == True
    )
    if platform and platform != "All":
        query = query.filter(SocialAccount.platform.ilike(platform))
    
    accounts = query.all()
    return accounts

@router.post("/saved-accounts")
def save_social_account(
    platform: str = Query(..., description="Platform name e.g. YouTube, Instagram, TikTok, LinkedIn, X"),
    handle: str = Query(..., description="Creator handle, Channel ID, or URL"),
    account_name: Optional[str] = Query(None, description="Optional custom channel name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save and connect a new channel/handle for creator.
    Enforces maximum limit of 5 saved channels/handles per platform.
    Automatically triggers initial synchronization.
    """
    p_norm = platform.strip().capitalize()
    h_clean = handle.strip()
    
    # Check limit of 5 saved accounts for this platform
    existing_count = db.query(SocialAccount).filter(
        SocialAccount.creator_id == current_user.id,
        SocialAccount.platform == p_norm,
        SocialAccount.is_active == True
    ).count()

    if existing_count >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum limit of 5 saved channels/handles reached for {p_norm}. Remove an existing channel to add another."
        )

    # Check duplicate
    existing_acc = db.query(SocialAccount).filter(
        SocialAccount.creator_id == current_user.id,
        SocialAccount.platform == p_norm,
        SocialAccount.account_handle == h_clean,
        SocialAccount.is_active == True
    ).first()

    if existing_acc:
        account_obj = existing_acc
    else:
        account_obj = SocialAccount(
            creator_id=current_user.id,
            platform=p_norm,
            account_handle=h_clean,
            account_name=account_name or f"{p_norm} ({h_clean})",
            account_id=h_clean,
            is_active=True
        )
        db.add(account_obj)
        db.commit()
        db.refresh(account_obj)

    # Trigger automatic initial synchronization
    if p_norm.lower() == "youtube":
        YouTubeService.sync_youtube_videos(db, creator_id=current_user.id, channel_id=h_clean)
    elif p_norm.lower() == "instagram":
        InstagramService.sync_instagram_media(db, creator_id=current_user.id, instagram_handle=h_clean)
    else:
        SocialMediaService.sync_platform_data(db, platform=p_norm, creator_id=current_user.id)

    return {
        "message": f"Successfully saved and synchronized {p_norm} account '{h_clean}'",
        "account": account_obj
    }

@router.delete("/saved-accounts/{account_id}")
def delete_saved_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a saved social channel/handle."""
    acc = db.query(SocialAccount).filter(
        SocialAccount.id == account_id,
        SocialAccount.creator_id == current_user.id
    ).first()

    if not acc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved account not found")

    db.delete(acc)
    db.commit()
    return {"message": "Channel/handle removed successfully"}

@router.post("/auto-sync")
def auto_sync_all_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Automatically synchronize real-time data for all saved channels & handles belonging to the creator.
    """
    accounts = db.query(SocialAccount).filter(
        SocialAccount.creator_id == current_user.id,
        SocialAccount.is_active == True
    ).all()

    synced_details = []
    
    if not accounts:
        # Default auto-sync for default platforms
        res_yt = YouTubeService.sync_youtube_videos(db, creator_id=current_user.id, channel_id="UC_CreatorIQ_Official")
        res_ig = InstagramService.sync_instagram_media(db, creator_id=current_user.id, instagram_handle="@creatoriq_official")
        return {
            "message": "Auto-sync completed for default creator channels",
            "synced_accounts_count": 2
        }

    for acc in accounts:
        p_lower = acc.platform.lower()
        if p_lower == "youtube":
            YouTubeService.sync_youtube_videos(db, creator_id=current_user.id, channel_id=acc.account_handle)
        elif p_lower == "instagram":
            InstagramService.sync_instagram_media(db, creator_id=current_user.id, instagram_handle=acc.account_handle)
        else:
            SocialMediaService.sync_platform_data(db, platform=acc.platform, creator_id=current_user.id)
        
        acc.last_synced_at = datetime.utcnow()
        synced_details.append(f"{acc.platform}: {acc.account_handle}")

    db.commit()
    return {
        "message": f"Successfully auto-synced {len(synced_details)} saved channels/handles",
        "synced": synced_details
    }

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
