import re
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import ContentItem
from app.models.audience import AudienceSnapshot
from app.schemas.growth import GrowthSummary, HashtagCount
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/growth", tags=["growth-trend-analysis"])


def extract_hashtags(titles: list[str]) -> list[HashtagCount]:
    """Very simple hashtag/keyword extractor from video titles as a stand-in
    for real hashtag analysis (which needs full video descriptions/tags)."""
    words = []
    for title in titles:
        found = re.findall(r"#(\w+)", title)
        words.extend(found)
        # also grab notable capitalized keywords as pseudo-tags if no # found
        if not found:
            words.extend([w.lower() for w in re.findall(r"\b[A-Z][a-z]{3,}\b", title)])
    counts = Counter(words)
    return [HashtagCount(tag=tag, count=count) for tag, count in counts.most_common(10)]


@router.get("/summary", response_model=GrowthSummary)
def growth_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = (
        db.query(ContentItem)
        .filter(ContentItem.owner_id == current_user.id)
        .order_by(ContentItem.published_at.asc())
        .all()
    )

    if not items:
        return GrowthSummary(
            total_content_growth=0, avg_views_per_video=0.0,
            trending_direction="stable", top_hashtags=[], reach_prediction_next_period=0,
        )

    total_views = sum(i.views for i in items)
    avg_views = round(total_views / len(items), 2)

    # simple trend: compare first half vs second half average views
    half = len(items) // 2 or 1
    first_half_avg = sum(i.views for i in items[:half]) / half
    second_half_avg = sum(i.views for i in items[half:]) / max(len(items) - half, 1)

    if second_half_avg > first_half_avg * 1.1:
        direction = "up"
    elif second_half_avg < first_half_avg * 0.9:
        direction = "down"
    else:
        direction = "stable"

    # naive reach prediction: extrapolate recent average growth rate
    growth_rate = (second_half_avg - first_half_avg) / max(first_half_avg, 1)
    predicted_reach = int(total_views + total_views * max(growth_rate, 0))

    hashtags = extract_hashtags([i.title for i in items])

    return GrowthSummary(
        total_content_growth=len(items),
        avg_views_per_video=avg_views,
        trending_direction=direction,
        top_hashtags=hashtags,
        reach_prediction_next_period=predicted_reach,
    )


@router.get("/audience-growth")
def audience_growth_forecast(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    snapshots = (
        db.query(AudienceSnapshot)
        .filter(AudienceSnapshot.owner_id == current_user.id)
        .order_by(AudienceSnapshot.snapshot_date.asc())
        .all()
    )
    if len(snapshots) < 2:
        return {"message": "Not enough historical snapshots yet for a forecast", "data": []}

    history = [{"date": s.snapshot_date.strftime("%Y-%m-%d"), "followers": s.followers} for s in snapshots]
    growth = snapshots[-1].followers - snapshots[0].followers
    return {"history": history, "net_growth": growth}