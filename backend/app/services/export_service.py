import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

from openpyxl import Workbook
from openpyxl.styles import Font


def generate_pdf_report(report: dict) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("CreatorIQ Analytics Report", styles["Title"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Creator ID: {report['creator_id']}", styles["Normal"]))
    elements.append(Spacer(1, 20))

    # Content Performance Summary
    elements.append(Paragraph("Content Performance Summary", styles["Heading2"]))
    summary = report["content_performance"]["summary"]
    summary_data = [["Metric", "Value"]] + [[k.replace("_", " ").title(), str(v)] for k, v in summary.items()]
    t = Table(summary_data, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4a4a4a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))

    # Revenue Summary
    elements.append(Paragraph("Revenue Analytics", styles["Heading2"]))
    revenue = report["revenue_analytics"]
    elements.append(Paragraph(f"Total Revenue: {revenue['total_revenue']}", styles["Normal"]))
    elements.append(Spacer(1, 10))
    if revenue["revenue_by_source"]:
        rev_data = [["Source", "Amount"]] + [[k, str(v)] for k, v in revenue["revenue_by_source"].items()]
        t2 = Table(rev_data, hAlign="LEFT")
        t2.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4a4a4a")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(t2)
    elements.append(Spacer(1, 20))

    # Audience Summary
    elements.append(Paragraph("Audience Analytics", styles["Heading2"]))
    audience = report["audience_analytics"]
    elements.append(Paragraph(f"Total Followers: {audience['total_followers']}", styles["Normal"]))
    elements.append(Paragraph(f"Top Country: {audience['top_country']}", styles["Normal"]))
    elements.append(Paragraph(f"Top City: {audience['top_city']}", styles["Normal"]))
    elements.append(Paragraph(f"Top Device: {audience['top_device']}", styles["Normal"]))
    elements.append(Spacer(1, 20))

    # Growth Summary
    growth = report.get("growth_analytics", [])
    if growth:
        elements.append(Paragraph("Growth (Last 30 Days)", styles["Heading2"]))
        growth_data = [["Date", "Followers", "Daily Growth", "Growth %"]] + [
            [str(g["date"]), str(g["followers"]), str(g["daily_growth"]), str(g["growth_percentage"])]
            for g in growth
        ]
        t3 = Table(growth_data, hAlign="LEFT")
        t3.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4a4a4a")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(t3)

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_excel_report(report: dict) -> io.BytesIO:
    buffer = io.BytesIO()
    wb = Workbook()

    # Sheet 1: Content Summary
    ws1 = wb.active
    ws1.title = "Content Summary"
    ws1.append(["Metric", "Value"])
    for cell in ws1[1]:
        cell.font = Font(bold=True)
    for k, v in report["content_performance"]["summary"].items():
        ws1.append([k.replace("_", " ").title(), v])

    # Sheet 2: Top Content
    ws2 = wb.create_sheet("Top Content")
    if report["content_performance"]["top_content"]:
        headers = list(report["content_performance"]["top_content"][0].keys())
        ws2.append(headers)
        for cell in ws2[1]:
            cell.font = Font(bold=True)
        for item in report["content_performance"]["top_content"]:
            ws2.append(list(item.values()))

    # Sheet 3: Platform Comparison
    ws3 = wb.create_sheet("Platform Comparison")
    ws3.append(["Platform", "Views", "Reach", "Likes", "Comments", "Engagement Rate", "Growth Rate"])
    for cell in ws3[1]:
        cell.font = Font(bold=True)

    # platform_comparison is a dict keyed by platform name, e.g.
    # {"YouTube": {"views": ..., "reach": ..., "likes": ..., "comments": ...,
    #              "engagement_rate": ..., "growth_rate": ...}, ...}
    if isinstance(report["platform_comparison"], dict):
        for platform, data in report["platform_comparison"].items():
            ws3.append([
                platform,
                data.get("views"),
                data.get("reach"),
                data.get("likes"),
                data.get("comments"),
                data.get("engagement_rate"),
                data.get("growth_rate"),
            ])

    # Sheet 4: Revenue
    ws4 = wb.create_sheet("Revenue")
    ws4.append(["Total Revenue", report["revenue_analytics"]["total_revenue"]])
    ws4.append([])
    ws4.append(["Source", "Amount"])
    for cell in ws4[3]:
        cell.font = Font(bold=True)
    for source, amount in report["revenue_analytics"]["revenue_by_source"].items():
        ws4.append([source, amount])

    # Sheet 5: Audience
    ws5 = wb.create_sheet("Audience")
    audience = report["audience_analytics"]
    ws5.append(["Metric", "Value"])
    for cell in ws5[1]:
        cell.font = Font(bold=True)
    ws5.append(["Total Followers", audience["total_followers"]])
    ws5.append(["Total Reach", audience["total_reach"]])
    ws5.append(["Total Impressions", audience["total_impressions"]])
    ws5.append(["Top Country", audience["top_country"]])
    ws5.append(["Top City", audience["top_city"]])
    ws5.append(["Top Device", audience["top_device"]])

    # Sheet 6: Growth
    ws6 = wb.create_sheet("Growth")
    ws6.append(["Date", "Followers", "Daily Growth", "Growth %"])
    for cell in ws6[1]:
        cell.font = Font(bold=True)
    for entry in report.get("growth_analytics", []):
        ws6.append([
            str(entry.get("date")),
            entry.get("followers"),
            entry.get("daily_growth"),
            entry.get("growth_percentage"),
        ])

    wb.save(buffer)
    buffer.seek(0)
    return buffer