from typing import Any

from pydantic import BaseModel


class ReportResponse(BaseModel):
    creator_id: int
    report_type: str

    content_performance: dict[str, Any] = {}
    audience_analytics: dict[str, Any] = {}
    revenue: dict[str, Any] = {}
    growth_trends: dict[str, Any] = {}
    platform_comparison: dict[str, Any] = {}


class ReportExportResponse(BaseModel):
    creator_id: int
    report_type: str
    filename: str
    message: str