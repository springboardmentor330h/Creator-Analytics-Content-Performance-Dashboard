"""
PDF report generation.

Takes the dict produced by report_service.generate_creator_report() and
renders it as a PDF. This file never queries the database and never
computes a metric — every value it writes onto the page was already
computed by an existing service and handed to it. If a number in the
PDF is ever wrong, the bug is upstream in report_service or the
analytics service it called, not here.
"""
import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def generate_pdf_report(report: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=letter,
        topMargin=0.6 * inch, bottomMargin=0.6 * inch,
        leftMargin=0.6 * inch, rightMargin=0.6 * inch,
    )
    styles = getSampleStyleSheet()
    section_style = ParagraphStyle(
        "SectionHeading", parent=styles["Heading2"], spaceBefore=18, spaceAfter=8,
    )
    story = []

    story.append(Paragraph("CreatorIQ — Analytics Report", styles["Title"]))
    story.append(Paragraph(
        f"Creator: {report['creator']['name']} ({report['creator']['email']})",
        styles["Normal"],
    ))
    story.append(Paragraph(
        f"Generated: {report['generated_at'].strftime('%Y-%m-%d %H:%M UTC')}",
        styles["Normal"],
    ))
    story.append(Spacer(1, 16))

    story.append(Paragraph("KPI Summary", section_style))
    content_kpi = report["content"]["kpi_summary"]
    audience_kpi = report["audience"]["kpi_summary"]
    revenue_kpi = report["revenue"]["kpi_summary"]
    kpi_rows = [
        ["Metric", "Value"],
        ["Total Content", str(content_kpi["total_content"])],
        ["Avg Engagement Rate", f"{content_kpi['avg_engagement_rate']}%"],
        ["Total Followers", str(audience_kpi["total_followers"])],
        ["Audience Growth Rate", f"{audience_kpi['total_growth_rate_percent']}%"],
        ["Total Revenue", f"${revenue_kpi['total_revenue']:.2f}"],
        ["Pending Revenue", f"${revenue_kpi['pending_revenue']:.2f}"],
        ["Active Sponsorships", str(revenue_kpi["active_sponsorships"])],
    ]
    story.append(_styled_table(kpi_rows, col_widths=[3 * inch, 2 * inch]))

    story.append(Paragraph("Content Performance", section_style))
    top_content = report["content"]["top_performing"]
    if top_content:
        rows = [["Title", "Platform", "Reach", "Engagement Rate"]]
        for c in top_content:
            rows.append([
                _truncate(c["title"], 40), c["platform"].capitalize(),
                f"{c['reach']:,}", f"{c['engagement_rate']}%",
            ])
        story.append(_styled_table(rows, col_widths=[2.5 * inch, 1.2 * inch, 1.2 * inch, 1.4 * inch]))
    else:
        story.append(Paragraph("No content recorded yet.", styles["Normal"]))

    story.append(Paragraph("Audience Analytics", section_style))
    geo = report["audience"]["geographic_breakdown"]
    if geo:
        rows = [["Country", "Audience Share"]]
        for g in geo[:8]:
            rows.append([g["country"], f"{g['percentage']}%"])
        story.append(_styled_table(rows, col_widths=[3 * inch, 2 * inch]))
    else:
        story.append(Paragraph("No demographic data recorded yet.", styles["Normal"]))

    story.append(Paragraph("Revenue Analytics", section_style))
    trend = report["revenue"]["monthly_trend"]
    if trend:
        rows = [["Month", "Revenue"]]
        for t in trend:
            rows.append([t["month"], f"${t['total']:.2f}"])
        story.append(_styled_table(rows, col_widths=[3 * inch, 2 * inch]))
    else:
        story.append(Paragraph("No revenue recorded yet.", styles["Normal"]))

    story.append(PageBreak())

    story.append(Paragraph("Growth Trends by Platform", section_style))
    growth = report["growth"]["by_platform"]
    rows = [["Platform", "Growth Rate"]]
    for g in growth:
        rows.append([g["platform"].capitalize(), f"{g['growth_rate_percent']}%"])
    story.append(_styled_table(rows, col_widths=[3 * inch, 2 * inch]))

    story.append(Paragraph("Platform Comparison", section_style))
    snapshots = report["platforms"]["snapshots"]
    rows = [["Platform", "Followers", "Content", "Engagement", "Data Source"]]
    for s in snapshots:
        rows.append([
            s["platform"].capitalize(), f"{s['followers']:,}", str(s["total_content"]),
            f"{s['avg_engagement_rate']}%", "Simulated" if s["is_mock_data"] else "Live",
        ])
    story.append(_styled_table(rows, col_widths=[1.4 * inch, 1.3 * inch, 1 * inch, 1.3 * inch, 1.2 * inch]))

    doc.build(story)
    return buffer.getvalue()


def _styled_table(rows: list, col_widths: list) -> Table:
    table = Table(rows, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7c5cff")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f9")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def _truncate(text: str, max_len: int) -> str:
    return text if len(text) <= max_len else text[: max_len - 1] + "…"
