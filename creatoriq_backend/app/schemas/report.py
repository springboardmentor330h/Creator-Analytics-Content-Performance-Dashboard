from typing import Any, Optional

from pydantic import BaseModel, Field


class ReportRequest(BaseModel):
    """Optional filters when generating a report."""

    report_type: str = Field(
        default="full",
        description="full | content | audience | revenue | growth | platform",
    )


class ReportResponse(BaseModel):
    creator_id: int
    report_type: str
    generated_at: str
    summary: dict[str, Any]
    content_performance: list[dict[str, Any]] = []
    audience: dict[str, Any] = {}
    revenue: dict[str, Any] = {}
    growth: list[dict[str, Any]] = []
    platform_comparison: dict[str, Any] = {}
