import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.models.report import Report
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.revenue_service import RevenueService
from backend.app.services.audience_service import AudienceService
from backend.app.services.sponsorship_service import SponsorshipService
from backend.app.models.content import Content


class ReportService:

    REPORT_TYPES = [
        {
            "key": "executive_summary",
            "name": "Executive Comprehensive Report",
            "description": "All-in-one executive analysis combining Content, Audience, Revenue, and Growth metrics."
        },
        {
            "key": "content_performance",
            "name": "Content Performance Report",
            "description": "In-depth breakdown of views, likes, shares, comments, and engagement rates by content & platform."
        },
        {
            "key": "audience_analytics",
            "name": "Audience Analytics Report",
            "description": "Demographic breakdowns including age groups, device usage, locations, and reach trends."
        },
        {
            "key": "revenue_analytics",
            "name": "Revenue Analytics Report",
            "description": "Comprehensive revenue stream tracking, monthly earnings, and sponsorship deal statuses."
        },
        {
            "key": "growth_trends",
            "name": "Growth Trends Report",
            "description": "30-day historical follower growth, impression trajectory, and virality analysis."
        },
        {
            "key": "platform_comparison",
            "name": "Platform Comparison Report",
            "description": "Cross-platform analytics comparing YouTube, Instagram, TikTok, Twitter, and Twitch."
        }
    ]

    @staticmethod
    def get_available_report_types() -> List[Dict[str, str]]:
        return ReportService.REPORT_TYPES

    @staticmethod
    def generate_report_data(
        db: Session,
        creator_id: int,
        report_type: str = "executive_summary",
        date_range: str = "30_days"
    ) -> Dict[str, Any]:
        """
        Gathers real data from existing analytics, revenue, audience, and sponsorship services
        to build a unified, structured report payload.
        """
        user = db.query(User).filter(User.id == creator_id).first()
        creator_name = user.full_name if user else "Creator"
        creator_email = user.email if user else "creator@creatoriq.com"

        # Fetch existing analytical data modules
        analytics_summary = AnalyticsService.get_dashboard_summary(db)
        top_content = AnalyticsService.get_top_performing_content(db, limit=10)
        platform_perf = AnalyticsService.get_platform_performance(db)
        reach_breakdown = AnalyticsService.get_reach_breakdown(db)
        
        revenue_summary = RevenueService.get_revenue_summary(db, creator_id)
        revenue_by_source = RevenueService.get_revenue_by_source(db, creator_id)
        monthly_revenue = RevenueService.get_monthly_revenue(db, creator_id)
        
        audience_report = AudienceService.get_audience_report(db, creator_id)
        
        sponsorships = SponsorshipService.get_sponsorships(db, creator_id)

        all_content = db.query(Content).filter(Content.creator_id == creator_id).all()
        if not all_content:
            # Fallback to all content if multi-tenant content hasn't been re-assigned
            all_content = db.query(Content).all()

        type_meta = next((r for r in ReportService.REPORT_TYPES if r["key"] == report_type), ReportService.REPORT_TYPES[0])

        c_views = sum(c.views or 0 for c in all_content)
        c_likes = sum(c.likes or 0 for c in all_content)
        c_comments = sum(c.comments or 0 for c in all_content)
        c_shares = sum(c.shares or 0 for c in all_content)
        c_reach = sum(c.reach or 0 for c in all_content)

        rates = [
            AnalyticsService.calculate_engagement_rate(
                c.likes or 0, c.comments or 0, c.shares or 0, c.saves or 0, c.reach or 0
            )
            for c in all_content
        ]
        c_avg_eng = round(sum(rates) / len(rates), 2) if rates else 0.0

        # Synthesize Key Performance Indicators (KPIs)
        kpis = {
            "total_views": c_views if c_views > 0 else analytics_summary.get("total_views", 0),
            "total_likes": c_likes if c_likes > 0 else analytics_summary.get("total_likes", 0),
            "total_comments": c_comments if c_comments > 0 else analytics_summary.get("total_comments", 0),
            "total_shares": c_shares if c_shares > 0 else analytics_summary.get("total_shares", 0),
            "average_engagement_rate": c_avg_eng if c_avg_eng > 0 else analytics_summary.get("average_engagement_rate", 0.0),
            "total_followers": audience_report.get("total_followers") or analytics_summary.get("total_followers", 0),
            "combined_total_reach": c_reach if c_reach > 0 else reach_breakdown.get("combined_total_reach", 0),
            "total_revenue": revenue_summary.get("total_revenue", 0.0),
            "total_sponsorship_revenue": revenue_summary.get("total_sponsorship_revenue", 0.0),
            "active_sponsorships": len([s for s in sponsorships if (s.status or '').lower() in ['active', 'in progress']]),
            "best_platform": analytics_summary.get("best_platform") or "YouTube",
            "total_content_items": len(all_content)
        }

        # Build Insights & Strategic Recommendations
        insights = []
        recommendations = []

        if kpis["best_platform"]:
            insights.append(f"Highest performing channel is {kpis['best_platform']} with strong audience engagement.")
        
        if kpis["total_revenue"] > 0:
            insights.append(f"Recorded cumulative earnings total ${kpis['total_revenue']:,.2f} USD.")
            if revenue_by_source:
                top_source = max(revenue_by_source, key=lambda x: x.get("amount", 0))
                insights.append(f"Primary revenue driver is '{top_source.get('source')}' contributing ${top_source.get('amount', 0):,.2f}.")

        if kpis["average_engagement_rate"] >= 5.0:
            recommendations.append("Audience engagement is exceptionally strong (>5.0%). Leverage current content formats for brand deals.")
        else:
            recommendations.append("To increase engagement above 5.0%, optimize post posting schedules and include stronger calls-to-action.")

        if sponsorships:
            pending_count = len([s for s in sponsorships if s.payment_status in ["Pending", "Unpaid"]])
            if pending_count > 0:
                recommendations.append(f"Follow up on {pending_count} pending sponsorship payment(s) to optimize cash flow.")

        # Serialize full content items table
        content_table = []
        for c in all_content:
            eng_rate = AnalyticsService.calculate_engagement_rate(
                c.likes or 0, c.comments or 0, c.shares or 0, c.saves or 0, c.reach or 0
            )
            content_table.append({
                "id": c.id,
                "title": getattr(c, 'content_title', 'Untitled'),
                "platform": c.platform,
                "views": c.views or 0,
                "likes": c.likes or 0,
                "comments": c.comments or 0,
                "shares": c.shares or 0,
                "engagement_rate": eng_rate,
                "published_at": c.published_date.isoformat() if c.published_date else None
            })

        # Serialize revenue items table
        revenue_table = [
            {
                "source": r.get("source"),
                "amount": r.get("amount"),
                "percentage": r.get("percentage")
            }
            for r in revenue_by_source
        ]

        # Serialize sponsorships table
        sponsorship_table = [
            {
                "id": s.id,
                "brand_name": s.brand_name,
                "campaign_name": s.campaign_name,
                "amount": getattr(s, 'contract_value', 0.0),
                "contract_value": getattr(s, 'contract_value', 0.0),
                "status": s.status,
                "payment_status": s.payment_status,
                "start_date": s.start_date.isoformat() if s.start_date else None,
                "end_date": s.end_date.isoformat() if s.end_date else None
            }
            for s in sponsorships
        ]

        report_payload = {
            "title": f"CreatorIQ {type_meta['name']}",
            "report_type": report_type,
            "report_type_name": type_meta['name'],
            "date_range": date_range,
            "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "creator": {
                "id": creator_id,
                "name": creator_name,
                "email": creator_email
            },
            "kpis": kpis,
            "insights": insights,
            "recommendations": recommendations,
            "tables": {
                "top_content": top_content,
                "content_performance": content_table,
                "platform_performance": platform_perf,
                "reach_breakdown": reach_breakdown.get("platform_breakdown", []),
                "revenue_by_source": revenue_table,
                "monthly_revenue": monthly_revenue,
                "sponsorships": sponsorship_table,
                "audience_demographics": audience_report
            }
        }

        return report_payload

    @staticmethod
    def create_and_save_report(
        db: Session,
        creator_id: int,
        report_type: str = "executive_summary",
        date_range: str = "30_days"
    ) -> Report:
        summary_data = ReportService.generate_report_data(db, creator_id, report_type, date_range)
        report = Report(
            creator_id=creator_id,
            title=summary_data["title"],
            report_type=report_type,
            date_range=date_range,
            summary_json=json.dumps(summary_data)
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def get_creator_reports(db: Session, creator_id: int) -> List[Report]:
        return db.query(Report).filter(Report.creator_id == creator_id).order_by(Report.created_at.desc()).all()

    @staticmethod
    def get_report_by_id(db: Session, creator_id: int, report_id: int) -> Optional[Report]:
        return db.query(Report).filter(
            Report.id == report_id,
            Report.creator_id == creator_id
        ).first()

    @staticmethod
    def delete_report(db: Session, creator_id: int, report_id: int) -> bool:
        report = db.query(Report).filter(
            Report.id == report_id,
            Report.creator_id == creator_id
        ).first()
        if report:
            db.delete(report)
            db.commit()
            return True
        return False
