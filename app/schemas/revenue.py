from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class RevenueCreate(BaseModel):
    creator_id: int = Field(..., gt=0)

    source: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    amount: float = Field(
        ...,
        ge=0
    )

    description: Optional[str] = Field(
        None,
        max_length=255
    )

    date: date


class RevenueUpdate(BaseModel):
    source: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100
    )

    amount: Optional[float] = Field(
        None,
        ge=0
    )

    description: Optional[str] = Field(
        None,
        max_length=255
    )

    date: Optional[date] = None