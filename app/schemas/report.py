from typing import Any
from pydantic import BaseModel


class ReportResponse(BaseModel):
    summary: dict[str, Any]
    content_performance: list[dict[str, Any]]
    audience_analytics: dict[str, Any]
    revenue_analytics: dict[str, Any]
    growth_trends: list[dict[str, Any]]
    audience_trends: list[dict[str, Any]]
    platform_comparison: list[dict[str, Any]]