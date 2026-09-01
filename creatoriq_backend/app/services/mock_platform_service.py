"""
Mock / manual content samples for platforms without a live API.
Used for Facebook, LinkedIn, TikTok, Twitter (X), etc.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any


PLATFORM_SAMPLES: dict[str, list[dict[str, Any]]] = {
    "Facebook": [
        {
            "title": "Behind the scenes of our latest campaign",
            "views": 12400,
            "likes": 860,
            "comments": 92,
            "shares": 140,
            "saves": 45,
            "reach": 18500,
        },
        {
            "title": "Community Q&A highlights",
            "views": 8300,
            "likes": 520,
            "comments": 110,
            "shares": 65,
            "saves": 28,
            "reach": 11200,
        },
        {
            "title": "Product tip reel (Facebook)",
            "views": 20100,
            "likes": 1400,
            "comments": 180,
            "shares": 220,
            "saves": 90,
            "reach": 27600,
        },
    ],
    "LinkedIn": [
        {
            "title": "5 lessons from scaling a creator business",
            "views": 5600,
            "likes": 410,
            "comments": 67,
            "shares": 95,
            "saves": 120,
            "reach": 8900,
        },
        {
            "title": "Case study: engagement growth in 30 days",
            "views": 4200,
            "likes": 330,
            "comments": 54,
            "shares": 70,
            "saves": 88,
            "reach": 7100,
        },
        {
            "title": "Hiring creators vs agencies — what worked",
            "views": 3800,
            "likes": 290,
            "comments": 41,
            "shares": 52,
            "saves": 75,
            "reach": 6400,
        },
    ],
    "TikTok": [
        {
            "title": "Quick edit transition trend",
            "views": 85000,
            "likes": 9200,
            "comments": 640,
            "shares": 2100,
            "saves": 1500,
            "reach": 120000,
        },
        {
            "title": "Day in the life — studio setup",
            "views": 42000,
            "likes": 5100,
            "comments": 390,
            "shares": 980,
            "saves": 720,
            "reach": 61000,
        },
        {
            "title": "Sound-on storytelling tip",
            "views": 67000,
            "likes": 7400,
            "comments": 510,
            "shares": 1600,
            "saves": 1100,
            "reach": 95000,
        },
    ],
    "Twitter": [
        {
            "title": "Thread: content system that actually scales",
            "views": 15200,
            "likes": 980,
            "comments": 210,
            "shares": 340,
            "saves": 0,
            "reach": 22000,
        },
        {
            "title": "Poll results — best posting window",
            "views": 9100,
            "likes": 420,
            "comments": 160,
            "shares": 95,
            "saves": 0,
            "reach": 14000,
        },
        {
            "title": "Short tip: hooks that stop the scroll",
            "views": 11800,
            "likes": 760,
            "comments": 95,
            "shares": 180,
            "saves": 0,
            "reach": 17500,
        },
    ],
    "X": [
        {
            "title": "Thread: content system that actually scales",
            "views": 15200,
            "likes": 980,
            "comments": 210,
            "shares": 340,
            "saves": 0,
            "reach": 22000,
        },
        {
            "title": "Poll results — best posting window",
            "views": 9100,
            "likes": 420,
            "comments": 160,
            "shares": 95,
            "saves": 0,
            "reach": 14000,
        },
    ],
}


def build_mock_content_items(
    platform: str,
    count: int = 3,
) -> list[dict[str, Any]]:
    """
    Return CreatorIQ-shaped content dicts for a platform.
    """
    samples = PLATFORM_SAMPLES.get(platform) or [
        {
            "title": f"{platform} sample post",
            "views": 1000,
            "likes": 100,
            "comments": 10,
            "shares": 5,
            "saves": 3,
            "reach": 1500,
        }
    ]

    count = max(1, min(count, len(samples) if samples else 1, 20))
    today = date.today()
    items: list[dict[str, Any]] = []

    for i in range(count):
        s = samples[i % len(samples)]
        items.append(
            {
                "platform": platform,
                "external_content_id": f"mock-{platform.lower()}-{i + 1}",
                "content_title": s["title"],
                "views": int(s.get("views") or 0),
                "likes": int(s.get("likes") or 0),
                "comments": int(s.get("comments") or 0),
                "shares": int(s.get("shares") or 0),
                "saves": int(s.get("saves") or 0),
                "watch_time": int(s.get("watch_time") or 0),
                "reach": int(s.get("reach") or s.get("views") or 0),
                "published_date": today - timedelta(days=i * 3),
            }
        )
    return items
