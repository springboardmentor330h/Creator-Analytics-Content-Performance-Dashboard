from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentUpdate
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()

def calculate_engagement_rate(content: Content) -> float:
    """Engagement Rate = (Likes + Comments + Shares + Saves) / Views * 100"""
    if content.views == 0:
        return 0.0
    engagement = content.likes + content.comments + content.shares + content.saves
    return round((engagement / content.views) * 100, 2)

def serialize_content(content: Content) -> dict:
    return {
        "id": content.id,
        "user_id": content.user_id,
        "title": content.title,
        "platform": content.platform,
        "views": content.views,
        "likes": content.likes,
        "comments": content.comments,
        "shares": content.shares,
        "saves": content.saves,
        "watch_time": content.watch_time,
        "reach": content.reach,
        "engagement_rate": calculate_engagement_rate(content),
        "created_at": content.created_at
    }

# Create Content Entry
@router.post("/content")
def create_content(
    content: ContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_content = Content(**content.dict())
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    return serialize_content(new_content)

# Get All Content
@router.get("/content")
def get_all_content(db: Session = Depends(get_db)):
    contents = db.query(Content).all()
    return [serialize_content(c) for c in contents]

# Get Content by ID
@router.get("/content/{content_id}")
def get_content(content_id: int, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return serialize_content(content)

# Update Content
@router.put("/content/{content_id}")
def update_content(
    content_id: int,
    updated: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    for field, value in updated.dict(exclude_unset=True).items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)
    return serialize_content(content)

# Delete Content
@router.delete("/content/{content_id}")
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    db.delete(content)
    db.commit()
    return {"message": "Content deleted successfully"}

# Top-Performing Content Report
@router.get("/content/reports/top")
def top_performing_content(limit: int = 5, db: Session = Depends(get_db)):
    contents = db.query(Content).all()
    ranked = sorted(
        [serialize_content(c) for c in contents],
        key=lambda c: c["engagement_rate"],
        reverse=True
    )
    return {
        "count": len(ranked[:limit]),
        "data": ranked[:limit]
    }

# Content Comparison (compare 2+ content pieces side by side)
@router.get("/content/compare")
def compare_content(ids: str, db: Session = Depends(get_db)):
    """Usage: /content/compare?ids=1,2,3"""
    try:
        id_list = [int(i) for i in ids.split(",")]
    except ValueError:
        raise HTTPException(status_code=400, detail="ids must be comma-separated integers")

    contents = db.query(Content).filter(Content.id.in_(id_list)).all()
    if not contents:
        raise HTTPException(status_code=404, detail="No matching content found")

    return {
        "count": len(contents),
        "data": [serialize_content(c) for c in contents]
    }

# Reach Analysis
@router.get("/content/reports/reach")
def reach_analysis(db: Session = Depends(get_db)):
    contents = db.query(Content).all()
    if not contents:
        return {"total_reach": 0, "average_reach": 0, "count": 0}

    total_reach = sum(c.reach for c in contents)
    avg_reach = round(total_reach / len(contents), 2)

    return {
        "total_reach": total_reach,
        "average_reach": avg_reach,
        "count": len(contents)
    }