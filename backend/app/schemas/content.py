from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ContentBase(BaseModel):
    creator_id: int
    platform: str = Field(..., min_length=1)
    external_content_id: Optional[str] = None
    content_title: str = Field(..., min_length=3)
    views: int = Field(..., ge=0)
    likes: int = Field(..., ge=0)
    comments: int = Field(..., ge=0)
    shares: int = Field(..., ge=0)
    saves: int = Field(..., ge=0)
    watch_time: float = Field(..., ge=0)
    reach: int = Field(..., ge=0)
    published_date: date


class ContentCreate(ContentBase):
    """Schema used when creating a new content record (POST)."""
    pass


class ContentUpdate(BaseModel):
    """
    Schema used when updating an existing content record (PUT).
    All fields are optional so partial updates are possible, but any
    value that IS provided still has to pass the same validation rules.
    """
    creator_id: Optional[int] = None
    platform: Optional[str] = Field(None, min_length=1)
    external_content_id: Optional[str] = None
    content_title: Optional[str] = Field(None, min_length=3)
    views: Optional[int] = Field(None, ge=0)
    likes: Optional[int] = Field(None, ge=0)
    comments: Optional[int] = Field(None, ge=0)
    shares: Optional[int] = Field(None, ge=0)
    saves: Optional[int] = Field(None, ge=0)
    watch_time: Optional[float] = Field(None, ge=0)
    reach: Optional[int] = Field(None, ge=0)
    published_date: Optional[date] = None


class ContentResponse(ContentBase):
    """Schema returned to the client, includes the generated id."""
    id: int

    model_config = ConfigDict(from_attributes=True)