from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.models.user import User
from app.schemas.content import ContentCreate, ContentUpdate
from app.core.auth import get_current_user

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
def create_content(content: ContentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if content.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only create content for yourself")

    # Guard against accidental duplicate submissions (e.g. double-click, retried
    # request): same creator, platform, title, and publish date is treated as
    # the same piece of content.
    existing = db.query(Content).filter(
        Content.creator_id == content.creator_id,
        Content.platform == content.platform,
        Content.content_title == content.content_title,
        Content.published_date == content.published_date,
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Content '{content.content_title}' on {content.platform} published on "
                   f"{content.published_date} already exists (id: {existing.id})"
        )

    new_content = Content(**content.dict())
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    return serialize_content(new_content)

# Get All Content
@router.get("/content")
def get_all_content(platform: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Content).filter(Content.creator_id == current_user.id)
    if platform:
        query = query.filter(Content.platform == platform)
    contents = query.all()
    return [serialize_content(c) for c in contents]


# Get Content by ID
@router.get("/content/{content_id}")
def get_content(content_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    content = db.query(Content).filter(
        Content.id == content_id, Content.creator_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return serialize_content(content)

# Update Content
@router.put("/content/{content_id}")
def update_content(content_id: int, updated: ContentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    content = db.query(Content).filter(
        Content.id == content_id, Content.creator_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    update_data = updated.dict(exclude_unset=True)
    # Never allow reassigning content to a different creator via update
    update_data.pop("creator_id", None)

    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)
    return serialize_content(content)

# Delete Content
@router.delete("/content/{content_id}")
def delete_content(content_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    content = db.query(Content).filter(
        Content.id == content_id, Content.creator_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    db.delete(content)
    db.commit()
    return {"message": "Content deleted successfully"}
