"""
Reporting service — consumes existing analytics / revenue / audience data.
Does not re-implement analytics calculations from scratch where possible.
"""

from datetime import datetime
from io import BytesIO

from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.growth import Growth
from app.services.analytics_service import (
    calculate_engagement_rate,
    get_kpi_summary,
    get_platform_comparison,
    get_top_content,
)
from app.services.audience_service import (
    get_audience_report,
    get_growth_report,
)
from app.services import revenue_service


def build_creator_report(
    db: Session,
    creator_id: int,
    report_type: str = "full",
) -> dict:
    """
    Assemble a structured report for one creator.
    report_type: full | content | audience | revenue | growth | platform
    """

    report_type = (report_type or "full").lower().strip()
    generated_at = datetime.utcnow().isoformat() + "Z"

    # KPI summary is global in current analytics_service;
    # filter content-heavy sections by creator_id below.
    kpi = get_kpi_summary(db)

    contents = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .all()
    )

    content_performance = []
    for c in contents:
        total_eng, rate = calculate_engagement_rate(c)
        content_performance.append({
            "id": c.id,
            "title": c.content_title,
            "platform": c.platform,
            "views": c.views or 0,
            "likes": c.likes or 0,
            "comments": c.comments or 0,
            "shares": c.shares or 0,
            "saves": c.saves or 0,
            "reach": c.reach or 0,
            "watch_time": c.watch_time or 0,
            "total_engagement": total_eng,
            "engagement_rate": rate,
        })
    content_performance.sort(
        key=lambda x: x["engagement_rate"], reverse=True
    )

    audience = {}
    growth = []
    try:
        audience = get_audience_report(db)
    except Exception:
        audience = {}
    try:
        growth = get_growth_report(db)
    except Exception:
        growth = []

    revenue = {
        "total_revenue": revenue_service.get_total_revenue(db, creator_id),
        "by_source": revenue_service.get_revenue_by_source(db, creator_id),
    }
    try:
        revenue["monthly"] = revenue_service.get_monthly_revenue(db, creator_id)
    except Exception:
        revenue["monthly"] = []

    platform_comparison = get_platform_comparison(db)

    summary = {
        "total_content": len(contents),
        "total_views": sum(c.views or 0 for c in contents),
        "total_reach": sum(c.reach or 0 for c in contents),
        "average_engagement_rate": (
            round(
                sum(x["engagement_rate"] for x in content_performance)
                / len(content_performance),
                2,
            )
            if content_performance
            else 0
        ),
        "total_revenue": revenue["total_revenue"],
        "kpi_snapshot": kpi,
    }

    base = {
        "creator_id": creator_id,
        "report_type": report_type,
        "generated_at": generated_at,
        "summary": summary,
        "content_performance": [],
        "audience": {},
        "revenue": {},
        "growth": [],
        "platform_comparison": {},
    }

    if report_type in ("full", "content"):
        base["content_performance"] = content_performance
    if report_type in ("full", "audience"):
        base["audience"] = audience
    if report_type in ("full", "revenue"):
        base["revenue"] = revenue
    if report_type in ("full", "growth"):
        base["growth"] = growth if isinstance(growth, list) else []
    if report_type in ("full", "platform"):
        base["platform_comparison"] = platform_comparison

    return base


def export_report_excel(report: dict) -> bytes:
    """Generate an Excel workbook from a report dict."""
    try:
        from openpyxl import Workbook
    except ImportError as exc:
        raise RuntimeError(
            "openpyxl is required for Excel export. "
            "Run: pip install openpyxl"
        ) from exc

    wb = Workbook()

    # Summary sheet
    ws = wb.active
    ws.title = "Summary"
    ws.append(["CreatorIQ Report"])
    ws.append(["Creator ID", report.get("creator_id")])
    ws.append(["Report Type", report.get("report_type")])
    ws.append(["Generated At", report.get("generated_at")])
    ws.append([])
    ws.append(["Metric", "Value"])
    for key, value in (report.get("summary") or {}).items():
        if not isinstance(value, (dict, list)):
            ws.append([key, value])

    # Content sheet
    content_rows = report.get("content_performance") or []
    if content_rows:
        ws2 = wb.create_sheet("Content")
        headers = list(content_rows[0].keys())
        ws2.append(headers)
        for row in content_rows:
            ws2.append([row.get(h) for h in headers])

    # Revenue sheet
    revenue = report.get("revenue") or {}
    by_source = revenue.get("by_source") or []
    if by_source:
        ws3 = wb.create_sheet("Revenue")
        ws3.append(["Total Revenue", revenue.get("total_revenue")])
        ws3.append([])
        if by_source and isinstance(by_source[0], dict):
            headers = list(by_source[0].keys())
            ws3.append(headers)
            for row in by_source:
                ws3.append([row.get(h) for h in headers])

    buffer = BytesIO()
    wb.save(buffer)
    return buffer.getvalue()


def export_report_pdf(report: dict) -> bytes:
    """Generate a simple PDF from a report dict."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import inch
        from reportlab.pdfgen import canvas
    except ImportError as exc:
        raise RuntimeError(
            "reportlab is required for PDF export. "
            "Run: pip install reportlab"
        ) from exc

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - inch

    def line(text: str, size: int = 11, gap: int = 16):
        nonlocal y
        if y < inch:
            c.showPage()
            y = height - inch
        c.setFont("Helvetica", size)
        c.drawString(inch, y, str(text)[:100])
        y -= gap

    line("CreatorIQ Analytics Report", size=16, gap=22)
    line(f"Creator ID: {report.get('creator_id')}")
    line(f"Type: {report.get('report_type')}")
    line(f"Generated: {report.get('generated_at')}")
    y -= 8
    line("Summary", size=13, gap=18)
    for key, value in (report.get("summary") or {}).items():
        if not isinstance(value, (dict, list)):
            line(f"  {key}: {value}")

    content_rows = report.get("content_performance") or []
    if content_rows:
        y -= 8
        line("Top Content", size=13, gap=18)
        for row in content_rows[:10]:
            line(
                f"  {row.get('title', '')[:40]} | "
                f"{row.get('platform')} | "
                f"ER {row.get('engagement_rate')}% | "
                f"views {row.get('views')}"
            )

    revenue = report.get("revenue") or {}
    if revenue:
        y -= 8
        line("Revenue", size=13, gap=18)
        line(f"  Total: {revenue.get('total_revenue')}")
        for src in revenue.get("by_source") or []:
            if isinstance(src, dict):
                line(
                    f"  {src.get('source', src)}: "
                    f"{src.get('total_amount', '')}"
                )

    c.save()
    return buffer.getvalue()
