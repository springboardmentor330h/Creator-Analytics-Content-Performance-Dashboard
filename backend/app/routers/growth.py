import re
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import Content
from app.models.audience import AudienceData
from app.schemas.growth import GrowthSummary, HashtagCount, AudienceGrowthForecast, AudienceGrowthPoint

router = APIRouter(prefix="/growth", tags=["growth-trend-analysis"])


def extract_keywords(titles: list[str]) -> list[HashtagCount]:
    words = []
    for title in titles:
        tags = re.findall(r"#(\w+)", title)
        words.extend(tags)
        if not tags:
            words.extend([w.lower() for w in re.findall(r"\b[A-Z][a-z]{3,}\b", title)])
    counts = Counter(words)
    return [HashtagCount(tag=tag, count=count) for tag, count in counts.most_common(10)]


@router.get("/creator/{creator_id}/summary", response_model=GrowthSummary)
def growth_summary(creator_id: int, db: Session = Depends(get_db)):
    items = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .order_by(Content.published_date.asc())
        .all()
    )

    if not items:
        return GrowthSummary(
            total_content_count=0, avg_views_per_content=0.0,
            trending_direction="stable", top_keywords=[], reach_prediction_next_period=0,
        )

    total_views = sum(i.views for i in items)
    avg_views = round(total_views / len(items), 2)

    half = len(items) // 2 or 1
    first_half_avg = sum(i.views for i in items[:half]) / half
    second_half_avg = sum(i.views for i in items[half:]) / max(len(items) - half, 1)

    if second_half_avg > first_half_avg * 1.1:
        direction = "up"
    elif second_half_avg < first_half_avg * 0.9:
        direction = "down"
    else:
        direction = "stable"

    growth_rate = (second_half_avg - first_half_avg) / max(first_half_avg, 1)
    predicted_reach = int(total_views + total_views * max(growth_rate, 0))

    return GrowthSummary(
        total_content_count=len(items),
        avg_views_per_content=avg_views,
        trending_direction=direction,
        top_keywords=extract_keywords([i.content_title for i in items]),
        reach_prediction_next_period=predicted_reach,
    )


@router.get("/creator/{creator_id}/audience-forecast", response_model=AudienceGrowthForecast)
def audience_growth_forecast(creator_id: int, db: Session = Depends(get_db)):
    snapshots = (
        db.query(AudienceData)
        .filter(AudienceData.creator_id == creator_id)
        .order_by(AudienceData.recorded_date.asc())
        .all()
    )
    if len(snapshots) < 2:
        return AudienceGrowthForecast(history=[], net_growth=0)

    history = [
        AudienceGrowthPoint(recorded_date=s.recorded_date.isoformat(), followers=s.followers)
        for s in snapshots
    ]
    net_growth = snapshots[-1].followers - snapshots[0].followers
    return AudienceGrowthForecast(history=history, net_growth=net_growth)