from pydantic import BaseModel
from typing import List


class HashtagCount(BaseModel):
    tag: str
    count: int


class GrowthSummary(BaseModel):
    total_content_count: int
    avg_views_per_content: float
    trending_direction: str
    top_keywords: List[HashtagCount]
    reach_prediction_next_period: int


class AudienceGrowthPoint(BaseModel):
    recorded_date: str
    followers: int


class AudienceGrowthForecast(BaseModel):
    history: List[AudienceGrowthPoint]
    net_growth: int