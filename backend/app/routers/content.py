from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentUpdate

router = APIRouter()

def serialize_content(content: Content) -> dict:
    return {
        "id": content.id,
        "creator_id": content.creator_id,
        "platform": content.platform,
        "content_title": content.content_title,
        "views": content.views,
        "likes": content.likes,
        "comments": content.comments,
        "shares": content.shares,
        "saves": content.saves,
        "watch_time": content.watch_time,
        "reach": content.reach,
        "published_date": content.published_date
    }

# Create Content
@router.post("/content")
def create_content(content: ContentCreate, db: Session = Depends(get_db)):
    new_content = Content(**content.dict())
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    return serialize_content(new_content)

# Get All Content
@router.get("/content")
def get_all_content(platform: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Content)
    if platform:
        query = query.filter(Content.platform == platform)
    contents = query.all()
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
def update_content(content_id: int, updated: ContentUpdate, db: Session = Depends(get_db)):
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
def delete_content(content_id: int, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    db.delete(content)
    db.commit()
    return {"message": "Content deleted successfully"}