from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class RevenueSummaryResponse(BaseModel):
    total_revenue: Decimal


class RevenueBySourceResponse(BaseModel):
    source: str
    total_revenue: Decimal


class MonthlyRevenueResponse(BaseModel):
    year: int
    month: int
    total_revenue: Decimal


class RevenueTrendResponse(BaseModel):
    date: date
    total_revenue: Decimal