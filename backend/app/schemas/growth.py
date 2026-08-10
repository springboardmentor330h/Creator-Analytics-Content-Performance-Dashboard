from pydantic import BaseModel
from typing import List

class HashtagCount(BaseModel):
    tag: str
    count: int

class GrowthSummary(BaseModel):
    total_content_growth: int
    avg_views_per_video: float
    trending_direction: str   # "up" / "down" / "stable"
    top_hashtags: List[HashtagCount]
    reach_prediction_next_period: int