from datetime import datetime
from typing import List
from pydantic import BaseModel

from app.schemas.content import KPISummary, ContentResponse, PlatformComparisonItem
from app.schemas.audience import AudienceKPISummary, DemographicBreakdown, GeographicBreakdown
from app.schemas.platform_analytics import CrossPlatformKPIs, PlatformSnapshot
from app.schemas.revenue import RevenueKPISummary, MonthlyRevenuePoint


class ReportCreatorInfo(BaseModel):
    id: str
    name: str
    email: str


class ContentReportSection(BaseModel):
    kpi_summary: KPISummary
    top_performing: List[ContentResponse]
    platform_comparison: List[PlatformComparisonItem]


class AudienceReportSection(BaseModel):
    kpi_summary: AudienceKPISummary
    age_breakdown: List[DemographicBreakdown]
    geographic_breakdown: List[GeographicBreakdown]


class RevenueReportSection(BaseModel):
    kpi_summary: RevenueKPISummary
    monthly_trend: List[MonthlyRevenuePoint]


class GrowthTrendReportSection(BaseModel):
    by_platform: List[dict]


class PlatformComparisonReportSection(BaseModel):
    cross_platform_kpis: CrossPlatformKPIs
    snapshots: List[PlatformSnapshot]


class CreatorReport(BaseModel):
    generated_at: datetime
    creator: ReportCreatorInfo
    content: ContentReportSection
    audience: AudienceReportSection
    revenue: RevenueReportSection
    growth: GrowthTrendReportSection
    platforms: PlatformComparisonReportSection
