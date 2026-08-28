from pydantic import BaseModel
from typing import Optional


class CombinedReport(BaseModel):
    creator_id: int
    content_summary: dict
    audience_summary: Optional[dict] = None
    revenue_summary: dict
    growth_summary: Optional[dict] = None
    platform_comparison: dict