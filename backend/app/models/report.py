from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from backend.app.db.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    report_type = Column(String, nullable=False, index=True)  # content_performance, audience_analytics, revenue_analytics, growth_trends, platform_comparison, executive_summary
    date_range = Column(String, nullable=False, default="30_days")
    summary_json = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
