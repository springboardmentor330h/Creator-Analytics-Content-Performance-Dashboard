from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

@router.get("")
def get_reports(platform: Optional[str] = Query(None)):
    return {
        "creator_id": 1,
        "platform_filter": platform or "All",
        "content_performance": {
            "total_content": 46,
            "total_views": 2457900,
            "total_likes": 198400,
            "total_comments": 19450,
            "total_shares": 27800,
            "total_reach": 892000,
        },
        "platform_comparison": [
            {"platform": "TikTok", "content_count": 9, "total_views": 890000, "engagement_rate": 18.26},
            {"platform": "Instagram", "content_count": 10, "total_views": 561800, "engagement_rate": 15.79},
            {"platform": "X", "content_count": 7, "total_views": 238800, "engagement_rate": 12.30},
            {"platform": "LinkedIn", "content_count": 8, "total_views": 217600, "engagement_rate": 11.93},
            {"platform": "YouTube", "content_count": 7, "total_views": 408900, "engagement_rate": 11.43},
            {"platform": "Facebook", "content_count": 5, "total_views": 140800, "engagement_rate": 9.55},
        ]
    }

@router.get("/content")
def get_content_report(platform: Optional[str] = Query(None)):
    return {
        "creator_id": 1,
        "total_content": 46,
        "total_views": 2457900,
        "total_likes": 198400,
        "total_comments": 19450,
        "total_shares": 27800,
        "total_reach": 892000,
        "content": []
    }

@router.get("/audience")
def get_audience_report(platform: Optional[str] = Query(None)):
    return {"creator_id": 1, "total_records": 18, "data": []}

@router.get("/revenue")
def get_revenue_report(platform: Optional[str] = Query(None)):
    return {"creator_id": 1, "total_records": 11, "total_revenue": 368500, "data": []}

@router.get("/platforms")
def get_platforms():
    return {
        "creator_id": 1,
        "total_platforms": 6,
        "data": [
            {"platform": "TikTok", "content_count": 9, "total_views": 890000, "engagement_rate": 18.26},
            {"platform": "Instagram", "content_count": 10, "total_views": 561800, "engagement_rate": 15.79},
            {"platform": "X", "content_count": 7, "total_views": 238800, "engagement_rate": 12.30},
            {"platform": "LinkedIn", "content_count": 8, "total_views": 217600, "engagement_rate": 11.93},
            {"platform": "YouTube", "content_count": 7, "total_views": 408900, "engagement_rate": 11.43},
            {"platform": "Facebook", "content_count": 5, "total_views": 140800, "engagement_rate": 9.55},
        ]
    }
