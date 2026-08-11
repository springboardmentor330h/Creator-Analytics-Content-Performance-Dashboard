from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentUpdate, ContentOut

router = APIRouter(prefix="/content", tags=["content"])


@router.post("", response_model=ContentOut, status_code=201)
def create_content(payload: ContentCreate, db: Session = Depends(get_db)):
    new_content = Content(**payload.model_dump())
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    return new_content


@router.get("", response_model=list[ContentOut])
def get_all_content(db: Session = Depends(get_db)):
    return db.query(Content).all()


@router.get("/{id}", response_model=ContentOut)
def get_content_by_id(id: int, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.id == id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content


@router.put("/{id}", response_model=ContentOut)
def update_content(id: int, payload: ContentUpdate, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.id == id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)
    return content


@router.delete("/{id}", status_code=200)
def delete_content(id: int, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.id == id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    db.delete(content)
    db.commit()
    return {"message": "Content deleted successfully"}