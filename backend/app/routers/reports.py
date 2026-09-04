from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

# Dummy datasets for router-level requests
MOCK_CONTENTS = [
    {"id": 1, "platform": "YouTube", "views": 45200, "likes": 3800, "comments": 420, "shares": 310, "reach": 52000},
    {"id": 2, "platform": "YouTube", "views": 28400, "likes": 2150, "comments": 290, "shares": 180, "reach": 34000},
    {"id": 3, "platform": "YouTube", "views": 62100, "likes": 5400, "comments": 610, "shares": 490, "reach": 71000},
    {"id": 4, "platform": "YouTube", "views": 84000, "likes": 7800, "comments": 890, "shares": 710, "reach": 95000},
    {"id": 5, "platform": "YouTube", "views": 39500, "likes": 3100, "comments": 340, "shares": 220, "reach": 44000},
    {"id": 6, "platform": "YouTube", "views": 51200, "likes": 4300, "comments": 480, "shares": 350, "reach": 58000},
    {"id": 7, "platform": "YouTube", "views": 98500, "likes": 9200, "comments": 1150, "shares": 840, "reach": 112000},
    {"id": 8, "platform": "Instagram", "views": 38500, "likes": 4900, "comments": 540, "shares": 620, "reach": 48000},
    {"id": 9, "platform": "Instagram", "views": 52000, "likes": 6300, "comments": 680, "shares": 890, "reach": 64000},
    {"id": 10, "platform": "Instagram", "views": 44100, "likes": 5800, "comments": 610, "shares": 740, "reach": 56000},
    {"id": 11, "platform": "Instagram", "views": 68200, "likes": 8400, "comments": 920, "shares": 1120, "reach": 82000},
    {"id": 12, "platform": "Instagram", "views": 31500, "likes": 3900, "comments": 410, "shares": 480, "reach": 39000},
    {"id": 13, "platform": "Instagram", "views": 49800, "likes": 6100, "comments": 590, "shares": 780, "reach": 61000},
    {"id": 14, "platform": "Instagram", "views": 74500, "likes": 9300, "comments": 1040, "shares": 1350, "reach": 89000},
    {"id": 15, "platform": "Instagram", "views": 58000, "likes": 7200, "comments": 780, "shares": 920, "reach": 71000},
    {"id": 16, "platform": "Instagram", "views": 63200, "likes": 7900, "comments": 890, "shares": 950, "reach": 77000},
    {"id": 17, "platform": "Instagram", "views": 82000, "likes": 10500, "comments": 1200, "shares": 1680, "reach": 99000},
    {"id": 18, "platform": "TikTok", "views": 64000, "likes": 8200, "comments": 730, "shares": 940, "reach": 78000},
    {"id": 19, "platform": "TikTok", "views": 95400, "likes": 14200, "comments": 1250, "shares": 1890, "reach": 115000},
    {"id": 20, "platform": "TikTok", "views": 81200, "likes": 11800, "comments": 980, "shares": 1420, "reach": 98000},
    {"id": 21, "platform": "TikTok", "views": 112000, "likes": 16900, "comments": 1540, "shares": 2410, "reach": 134000},
    {"id": 22, "platform": "TikTok", "views": 73400, "likes": 9800, "comments": 810, "shares": 1120, "reach": 89000},
    {"id": 23, "platform": "TikTok", "views": 128000, "likes": 19400, "comments": 1680, "shares": 2950, "reach": 152000},
    {"id": 24, "platform": "TikTok", "views": 89000, "likes": 13100, "comments": 1120, "shares": 1640, "reach": 107000},
    {"id": 25, "platform": "TikTok", "views": 142000, "likes": 21500, "comments": 1950, "shares": 3400, "reach": 168000},
    {"id": 26, "platform": "TikTok", "views": 105000, "likes": 15600, "comments": 1340, "shares": 2180, "reach": 124000},
    {"id": 27, "platform": "LinkedIn", "views": 18200, "likes": 1450, "comments": 210, "shares": 340, "reach": 24000},
    {"id": 28, "platform": "LinkedIn", "views": 24500, "likes": 2100, "comments": 310, "shares": 490, "reach": 31000},
    {"id": 29, "platform": "LinkedIn", "views": 15800, "likes": 1290, "comments": 180, "shares": 270, "reach": 21000},
    {"id": 30, "platform": "LinkedIn", "views": 29800, "likes": 2850, "comments": 420, "shares": 610, "reach": 38000},
    {"id": 31, "platform": "LinkedIn", "views": 34200, "likes": 3200, "comments": 480, "shares": 710, "reach": 44000},
    {"id": 32, "platform": "LinkedIn", "views": 22400, "likes": 1980, "comments": 260, "shares": 380, "reach": 29000},
    {"id": 33, "platform": "LinkedIn", "views": 41500, "likes": 4100, "comments": 580, "shares": 890, "reach": 55000},
    {"id": 34, "platform": "LinkedIn", "views": 31200, "likes": 2900, "comments": 390, "shares": 540, "reach": 41000},
    {"id": 35, "platform": "X", "views": 14500, "likes": 980, "comments": 140, "shares": 260, "reach": 19500},
    {"id": 36, "platform": "X", "views": 38200, "likes": 3150, "comments": 490, "shares": 840, "reach": 48000},
    {"id": 37, "platform": "X", "views": 22100, "likes": 1840, "comments": 280, "shares": 410, "reach": 29000},
    {"id": 38, "platform": "X", "views": 54200, "likes": 4900, "comments": 820, "shares": 1250, "reach": 68000},
    {"id": 39, "platform": "X", "views": 29400, "likes": 2400, "comments": 310, "shares": 580, "reach": 37000},
    {"id": 40, "platform": "X", "views": 48900, "likes": 4200, "comments": 560, "shares": 1140, "reach": 62000},
    {"id": 41, "platform": "X", "views": 31500, "likes": 2750, "comments": 340, "shares": 620, "reach": 42000},
    {"id": 42, "platform": "Facebook", "views": 21400, "likes": 1680, "comments": 240, "shares": 190, "reach": 28000},
    {"id": 43, "platform": "Facebook", "views": 34200, "likes": 2950, "comments": 390, "shares": 310, "reach": 42000},
    {"id": 44, "platform": "Facebook", "views": 19800, "likes": 1490, "comments": 190, "shares": 150, "reach": 25000},
    {"id": 45, "platform": "Facebook", "views": 38900, "likes": 3400, "comments": 420, "shares": 380, "reach": 49000},
    {"id": 46, "platform": "Facebook", "views": 26500, "likes": 2300, "comments": 310, "shares": 240, "reach": 33000},
]

def _filter_items(platform: Optional[str]):
    if platform and isinstance(platform, str) and platform.strip().lower() not in ["all", "all platforms", "none", "undefined", "null"]:
        return [c for c in MOCK_CONTENTS if c["platform"].lower() == platform.strip().lower()]
    return MOCK_CONTENTS

@router.get("")
def get_reports(platform: Optional[str] = Query(None)):
    items = _filter_items(platform)
    return {
        "creator_id": 1,
        "platform_filter": platform or "All",
        "content_performance": {
            "total_content": len(items),
            "total_views": sum(c["views"] for c in items),
            "total_likes": sum(c["likes"] for c in items),
            "total_comments": sum(c["comments"] for c in items),
            "total_shares": sum(c["shares"] for c in items),
            "total_reach": sum(c["reach"] for c in items),
            "content": items,
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
    items = _filter_items(platform)
    return {
        "creator_id": 1,
        "platform_filter": platform or "All",
        "total_content": len(items),
        "total_views": sum(c["views"] for c in items),
        "total_likes": sum(c["likes"] for c in items),
        "total_comments": sum(c["comments"] for c in items),
        "total_shares": sum(c["shares"] for c in items),
        "total_reach": sum(c["reach"] for c in items),
        "content": items,
        "data": items,
        "items": items
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

