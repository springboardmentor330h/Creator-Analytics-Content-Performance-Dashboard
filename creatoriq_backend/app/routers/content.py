from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentUpdate


router = APIRouter(
    prefix="/content",
    tags=["Content Analytics"],
)


@router.post("/")
def create_content(
    content: ContentCreate,
    db: Session = Depends(get_db),
):
    new_content = Content(**content.model_dump())

    db.add(new_content)
    db.commit()
    db.refresh(new_content)

    return new_content


@router.get("/")
def get_all_content(
    db: Session = Depends(get_db),
):
    contents = db.query(Content).all()

    return contents


@router.get("/{content_id}")
def get_content(
    content_id: int,
    db: Session = Depends(get_db),
):
    content = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found",
        )

    return content


@router.put("/{content_id}")
def update_content(
    content_id: int,
    content_data: ContentUpdate,
    db: Session = Depends(get_db),
):
    content = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found",
        )

    update_data = content_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)

    return content


@router.delete("/{content_id}")
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
):
    content = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found",
        )

    db.delete(content)
    db.commit()

    return {
        "message": "Content deleted successfully"
    }