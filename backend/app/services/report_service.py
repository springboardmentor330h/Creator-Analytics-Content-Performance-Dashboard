"""
Report Service module.
Generates comprehensive report structures (executive summaries, content performance, audience analytics, growth trends, platform comparisons).
"""

import json
from datetime import datetime, timedelta, date
from collections import defaultdict
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.models.report import Report
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.revenue_service import RevenueService
from backend.app.services.audience_service import AudienceService
from backend.app.services.sponsorship_service import SponsorshipService
from backend.app.models.content import Content
from backend.app.models.revenue import Revenue
from backend.app.models.sponsorship import Sponsorship


class ReportService:
    """
    Handles report data aggregation across analytics, revenue, audience, and sponsorships.
    """

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
            "description": "Cross-platform analytics comparing YouTube, Instagram, Facebook, LinkedIn, and X."
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
        to build a unified, structured report payload filtered by date_range horizon.
        """
        user = db.query(User).filter(User.id == creator_id).first()
        creator_name = user.full_name if user else "Creator"
        creator_email = user.email if user else "creator@creatoriq.com"

        # Determine cutoff date based on date_range
        now_dt = datetime.utcnow()
        today_date = now_dt.date()
        cutoff_date = None

        if date_range == "7_days":
            cutoff_date = today_date - timedelta(days=7)
        elif date_range == "30_days":
            cutoff_date = today_date - timedelta(days=30)
        elif date_range == "90_days":
            cutoff_date = today_date - timedelta(days=90)

        # 1. Fetch & filter Content
        query_content = db.query(Content).filter(Content.creator_id == creator_id)
        content_items = query_content.all()
        if not content_items:
            content_items = db.query(Content).all()

        if cutoff_date and content_items:
            filtered_content = []
            for c in content_items:
                if c.published_date:
                    p_date = c.published_date.date() if isinstance(c.published_date, datetime) else c.published_date
                    if p_date >= cutoff_date:
                        filtered_content.append(c)
            # Fallback to relative cutoff from maximum published date if sparse
            if not filtered_content:
                all_dates = [c.published_date.date() if isinstance(c.published_date, datetime) else c.published_date for c in content_items if c.published_date]
                if all_dates:
                    max_d = max(all_dates)
                    days_offset = 7 if date_range == "7_days" else (30 if date_range == "30_days" else 90)
                    rel_cutoff = max_d - timedelta(days=days_offset)
                    filtered_content = [c for c in content_items if c.published_date and (c.published_date.date() if isinstance(c.published_date, datetime) else c.published_date) >= rel_cutoff]
            all_content = filtered_content if filtered_content else content_items
        else:
            all_content = content_items

        # 2. Fetch & filter Revenue
        query_revenue = db.query(Revenue).filter(Revenue.creator_id == creator_id)
        revenue_items = query_revenue.all()
        if not revenue_items:
            revenue_items = db.query(Revenue).all()

        if cutoff_date and revenue_items:
            filtered_revenue = []
            for r in revenue_items:
                if r.date:
                    r_date = r.date.date() if isinstance(r.date, datetime) else r.date
                    if r_date >= cutoff_date:
                        filtered_revenue.append(r)
            if not filtered_revenue:
                all_r_dates = [r.date.date() if isinstance(r.date, datetime) else r.date for r in revenue_items if r.date]
                if all_r_dates:
                    max_rd = max(all_r_dates)
                    days_offset = 7 if date_range == "7_days" else (30 if date_range == "30_days" else 90)
                    rel_r_cutoff = max_rd - timedelta(days=days_offset)
                    filtered_revenue = [r for r in revenue_items if r.date and (r.date.date() if isinstance(r.date, datetime) else r.date) >= rel_r_cutoff]
            all_revenues = filtered_revenue if filtered_revenue else revenue_items
        else:
            all_revenues = revenue_items

        # 3. Fetch & filter Sponsorships
        query_sponsorship = db.query(Sponsorship).filter(Sponsorship.creator_id == creator_id)
        sponsorship_items = query_sponsorship.all()
        if not sponsorship_items:
            sponsorship_items = db.query(Sponsorship).all()

        if cutoff_date and sponsorship_items:
            filtered_sponsorships = []
            for s in sponsorship_items:
                s_date = s.start_date or s.created_at
                if s_date:
                    s_d = s_date.date() if isinstance(s_date, datetime) else s_date
                    if s_d >= cutoff_date:
                        filtered_sponsorships.append(s)
            all_sponsorships = filtered_sponsorships if filtered_sponsorships else sponsorship_items
        else:
            all_sponsorships = sponsorship_items

        audience_report = AudienceService.get_audience_report(db, creator_id)
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

        # Compute platform performance for filtered content
        plat_map: Dict[str, Dict[str, Any]] = {}
        for c in all_content:
            p = c.platform or 'Other'
            if p not in plat_map:
                plat_map[p] = {"platform": p, "total_views": 0, "total_likes": 0, "total_comments": 0, "total_reach": 0, "rates": []}
            plat_map[p]["total_views"] += (c.views or 0)
            plat_map[p]["total_likes"] += (c.likes or 0)
            plat_map[p]["total_comments"] += (c.comments or 0)
            plat_map[p]["total_reach"] += (c.reach or 0)
            eng = AnalyticsService.calculate_engagement_rate(c.likes or 0, c.comments or 0, c.shares or 0, c.saves or 0, c.reach or 0)
            plat_map[p]["rates"].append(eng)

        platform_perf = []
        for p, data in plat_map.items():
            avg_eng = round(sum(data["rates"]) / len(data["rates"]), 2) if data["rates"] else 0.0
            platform_perf.append({
                "platform": p,
                "total_views": data["total_views"],
                "total_likes": data["total_likes"],
                "total_comments": data["total_comments"],
                "total_reach": data["total_reach"],
                "average_engagement_rate": avg_eng
            })

        reach_breakdown_list = []
        for p, data in plat_map.items():
            pct = round((data["total_reach"] / c_reach * 100.0), 2) if c_reach > 0 else 0.0
            reach_breakdown_list.append({
                "platform": p,
                "reach": data["total_reach"],
                "percentage": pct
            })

        # Compute revenue breakdown by source for filtered revenues
        rev_source_map = defaultdict(float)
        for r in all_revenues:
            rev_source_map[r.source] += (r.amount or 0.0)
        tot_rev_val = sum(rev_source_map.values())
        revenue_by_source_table = []
        for src, amt in rev_source_map.items():
            pct = round((amt / tot_rev_val * 100.0), 2) if tot_rev_val > 0 else 0.0
            revenue_by_source_table.append({
                "source": src,
                "amount": round(amt, 2),
                "percentage": pct
            })
        revenue_by_source_table.sort(key=lambda x: x["amount"], reverse=True)

        # Monthly revenue calculation for filtered revenues
        m_map: Dict[str, Dict[str, Any]] = {}
        for r in sorted(all_revenues, key=lambda x: x.date if x.date else date.min):
            if not r.date:
                continue
            r_d = r.date.date() if isinstance(r.date, datetime) else r.date
            key = f"{r_d.strftime('%b')} {r_d.year}"
            if key not in m_map:
                m_map[key] = {"month": r_d.strftime("%b"), "year": r_d.year, "amount": 0.0, "by_source": defaultdict(float)}
            m_map[key]["amount"] += (r.amount or 0.0)
            m_map[key]["by_source"][r.source] += (r.amount or 0.0)
        monthly_revenue_table = [
            {
                "month": v["month"],
                "year": v["year"],
                "amount": round(v["amount"], 2),
                "by_source": {k: round(val, 2) for k, val in v["by_source"].items()}
            }
            for v in m_map.values()
        ]

        total_rev = round(sum(r.amount or 0.0 for r in all_revenues), 2)
        total_spon_rev = round(sum(getattr(s, 'contract_value', 0.0) or getattr(s, 'amount', 0.0) or 0.0 for s in all_sponsorships), 2)

        best_platform = max(platform_perf, key=lambda x: x["average_engagement_rate"])["platform"] if platform_perf else "YouTube"

        # Synthesize Key Performance Indicators (KPIs)
        kpis = {
            "total_views": c_views,
            "total_likes": c_likes,
            "total_comments": c_comments,
            "total_shares": c_shares,
            "average_engagement_rate": c_avg_eng,
            "total_followers": audience_report.get("total_followers", 0),
            "combined_total_reach": c_reach,
            "total_revenue": total_rev,
            "total_sponsorship_revenue": total_spon_rev,
            "active_sponsorships": len([s for s in all_sponsorships if (s.status or '').lower() in ['active', 'in progress']]),
            "best_platform": best_platform,
            "total_content_items": len(all_content)
        }

        # Build Insights & Strategic Recommendations
        insights = []
        recommendations = []

        horizon_label = date_range.replace('_', ' ').title()
        if kpis["best_platform"]:
            insights.append(f"Highest performing channel in {horizon_label} is {kpis['best_platform']} with strong audience engagement.")
        
        if kpis["total_revenue"] > 0:
            insights.append(f"Recorded earnings total ₹{kpis['total_revenue']:,.2f} INR for {horizon_label}.")
            if revenue_by_source_table:
                top_source = revenue_by_source_table[0]
                insights.append(f"Primary revenue driver is '{top_source['source']}' contributing ₹{top_source['amount']:,.2f}.")

        if kpis["average_engagement_rate"] >= 5.0:
            recommendations.append(f"Audience engagement for {horizon_label} is exceptionally strong ({kpis['average_engagement_rate']}%). Leverage current content formats for brand deals.")
        else:
            recommendations.append("To increase engagement above 5.0%, optimize post posting schedules and include stronger calls-to-action.")

        if all_sponsorships:
            pending_count = len([s for s in all_sponsorships if (s.payment_status or '').lower() in ["pending", "unpaid"]])
            if pending_count > 0:
                recommendations.append(f"Follow up on {pending_count} pending sponsorship payment(s) to optimize cash flow.")

        # Top content table (top 10 by engagement)
        sorted_all_content = sorted(
            all_content,
            key=lambda c: AnalyticsService.calculate_engagement_rate(c.likes or 0, c.comments or 0, c.shares or 0, c.saves or 0, c.reach or 0),
            reverse=True
        )
        top_content_table = []
        for c in sorted_all_content[:10]:
            top_content_table.append({
                "content_id": c.id,
                "content_title": getattr(c, 'content_title', 'Untitled'),
                "platform": c.platform,
                "views": c.views or 0,
                "reach": c.reach or 0,
                "watch_time": getattr(c, 'watch_time', 0),
                "engagement_rate": AnalyticsService.calculate_engagement_rate(c.likes or 0, c.comments or 0, c.shares or 0, c.saves or 0, c.reach or 0)
            })

        # Content performance table
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

        # Sponsorships table
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
            for s in all_sponsorships
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
                "top_content": top_content_table,
                "content_performance": content_table,
                "platform_performance": platform_perf,
                "reach_breakdown": reach_breakdown_list,
                "revenue_by_source": revenue_by_source_table,
                "monthly_revenue": monthly_revenue_table,
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
