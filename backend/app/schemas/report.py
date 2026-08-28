from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime


class ReportTypeInfo(BaseModel):
    key: str
    name: str
    description: str


class ReportGenerateRequest(BaseModel):
    report_type: str = Field("executive_summary", example="revenue_analytics")
    date_range: str = Field("30_days", example="30_days")


class ReportResponse(BaseModel):
    id: Optional[int] = None
    creator_id: int
    title: str
    report_type: str
    date_range: str
    summary_data: Dict[str, Any]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReportSummaryResponse(BaseModel):
    reports: List[ReportResponse]
