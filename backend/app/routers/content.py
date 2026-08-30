from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentUpdate


router = APIRouter(
    prefix="/content",
    tags=["Content"]
)


# CREATE CONTENT
@router.post("/")
def create_content(
    content: ContentCreate,
    db: Session = Depends(get_db)
):
    new_content = Content(
        creator_id=content.creator_id,
        platform=content.platform,
        content_title=content.content_title,
        views=content.views,
        likes=content.likes,
        comments=content.comments,
        shares=content.shares,
        saves=content.saves,
        watch_time=content.watch_time,
        reach=content.reach,
        published_date=content.published_date
    )

    db.add(new_content)
    db.commit()
    db.refresh(new_content)

    return {
        "message": "Content created successfully",
        "data": {
            "id": new_content.id,
            "creator_id": new_content.creator_id,
            "platform": new_content.platform,
            "content_title": new_content.content_title,
            "views": new_content.views,
            "likes": new_content.likes,
            "comments": new_content.comments,
            "shares": new_content.shares,
            "saves": new_content.saves,
            "watch_time": new_content.watch_time,
            "reach": new_content.reach,
            "published_date": new_content.published_date
        }
    }


# GET ALL CONTENT
@router.get("/")
def get_all_content(db: Session = Depends(get_db)):
    contents = db.query(Content).all()

    return {
        "message": "Content fetched successfully",
        "data": contents
    }


# GET CONTENT BY ID
@router.get("/{content_id}")
def get_content(
    content_id: int,
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return {
        "message": "Content fetched successfully",
        "data": content
    }


# UPDATE CONTENT
@router.put("/{content_id}")
def update_content(
    content_id: int,
    content_data: ContentUpdate,
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    update_data = content_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(content, key, value)

    db.commit()
    db.refresh(content)

    return {
        "message": "Content updated successfully",
        "data": content
    }


# DELETE CONTENT
@router.delete("/{content_id}")
def delete_content(
    content_id: int,
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    db.delete(content)
    db.commit()

    return {
        "message": "Content deleted successfully"
    }