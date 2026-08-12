from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentResponse, ContentUpdate

router = APIRouter(prefix="/content", tags=["Content Analytics"])


@router.post(
    "/", response_model=ContentResponse, status_code=status.HTTP_201_CREATED
)
def create_content(payload: ContentCreate, db: Session = Depends(get_db)):
    db_content = Content(**payload.model_dump())
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content


@router.post(
    "/bulk",
    response_model=List[ContentResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_bulk_content(
    payload: List[ContentCreate], db: Session = Depends(get_db)
):
    """Inserts multiple content items into PostgreSQL in a single request."""
    db_contents = [Content(**item.model_dump()) for item in payload]
    db.add_all(db_contents)
    db.commit()
    for item in db_contents:
        db.refresh(item)
    return db_contents


@router.get("/", response_model=List[ContentResponse])
def get_all_content(db: Session = Depends(get_db)):
    return db.query(Content).all()


@router.get("/{content_id}", response_model=ContentResponse)
def get_content_by_id(content_id: int, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with id {content_id} not found",
        )
    return db_content


@router.put("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: int, payload: ContentUpdate, db: Session = Depends(get_db)
):
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with id {content_id} not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_content, key, value)

    db.commit()
    db.refresh(db_content)
    return db_content


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(content_id: int, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with id {content_id} not found",
        )

    db.delete(db_content)
    db.commit()
    return None