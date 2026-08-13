from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentUpdate


router = APIRouter(
    prefix="/content",
    tags=["Content"]
)


@router.post("")
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
        "data": new_content
    }


@router.get("")
def get_contents(db: Session = Depends(get_db)):
    contents = db.query(Content).all()

    return {
        "message": "Content retrieved successfully",
        "count": len(contents),
        "data": contents
    }


@router.get("/{id}")
def get_content(id: int, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.id == id).first()

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return {
        "message": "Content retrieved successfully",
        "data": content
    }


@router.put("/{id}")
def update_content(
    id: int,
    content_data: ContentUpdate,
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == id).first()

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


@router.delete("/{id}")
def delete_content(id: int, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.id == id).first()

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