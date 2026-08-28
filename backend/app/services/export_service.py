import io
from typing import Dict, Any


class ExportService:

    @staticmethod
    def generate_pdf_report(report_data: Dict[str, Any]) -> bytes:
        """
        Generates a styled, publication-grade PDF report using ReportLab.
        Returns bytes stream for binary HTTP response.
        """
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.platypus import (
                SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
            )
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        except ImportError as e:
            raise RuntimeError(f"ReportLab package is required for PDF exports: {str(e)}")

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Custom Palette
        PRIMARY_COLOR = colors.HexColor("#1e3a8a")     # Navy Blue
        ACCENT_COLOR = colors.HexColor("#10b981")      # Emerald Green
        BG_LIGHT = colors.HexColor("#f8fafc")          # Slate Light
        TEXT_DARK = colors.HexColor("#1e293b")         # Slate Dark
        MUTED = colors.HexColor("#64748b")             # Slate Muted

        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=PRIMARY_COLOR,
            spaceAfter=4
        )

        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=MUTED,
            spaceAfter=12
        )

        h2_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=PRIMARY_COLOR,
            spaceBefore=14,
            spaceAfter=8
        )

        body_style = ParagraphStyle(
            'BodyDark',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=TEXT_DARK
        )

        bold_style = ParagraphStyle(
            'BodyDarkBold',
            parent=body_style,
            fontName='Helvetica-Bold'
        )

        kpi_title_style = ParagraphStyle(
            'KPITitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=MUTED
        )

        kpi_value_style = ParagraphStyle(
            'KPIValue',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=16,
            textColor=PRIMARY_COLOR
        )

        elements = []

        # 1. Header & Title Block
        title_text = report_data.get("title", "CreatorIQ Executive Analytics Report")
        elements.append(Paragraph(title_text, title_style))
        
        gen_time = report_data.get("generated_at", "")
        creator_info = report_data.get("creator", {})
        c_name = creator_info.get("name", "Creator")
        c_email = creator_info.get("email", "")
        date_rng = report_data.get("date_range", "30_days").replace("_", " ").title()

        sub_text = f"Prepared for: <b>{c_name}</b> ({c_email}) &nbsp;|&nbsp; Period: <b>{date_rng}</b> &nbsp;|&nbsp; Generated: {gen_time}"
        elements.append(Paragraph(sub_text, subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY_COLOR, spaceAfter=14))

        # 2. Key Performance Indicators (KPI Grid)
        kpis = report_data.get("kpis", {})
        elements.append(Paragraph("Executive Overview & KPIs", h2_style))

        kpi_cells = [
            [
                [Paragraph("TOTAL VIEWS", kpi_title_style), Paragraph(f"{kpis.get('total_views', 0):,}", kpi_value_style)],
                [Paragraph("TOTAL REVENUE", kpi_title_style), Paragraph(f"${kpis.get('total_revenue', 0.0):,.2f}", kpi_value_style)],
                [Paragraph("AVG ENGAGEMENT", kpi_title_style), Paragraph(f"{kpis.get('average_engagement_rate', 0.0):.2f}%", kpi_value_style)],
                [Paragraph("TOTAL FOLLOWERS", kpi_title_style), Paragraph(f"{kpis.get('total_followers', 0):,}", kpi_value_style)]
            ],
            [
                [Paragraph("ORGANIC REACH", kpi_title_style), Paragraph(f"{kpis.get('combined_total_reach', 0):,}", kpi_value_style)],
                [Paragraph("SPONSORSHIP REV", kpi_title_style), Paragraph(f"${kpis.get('total_sponsorship_revenue', 0.0):,.2f}", kpi_value_style)],
                [Paragraph("TOP PLATFORM", kpi_title_style), Paragraph(str(kpis.get('best_platform', 'YouTube')), kpi_value_style)],
                [Paragraph("TOTAL CONTENT", kpi_title_style), Paragraph(f"{kpis.get('total_content_items', 0)} Items", kpi_value_style)]
            ]
        ]

        kpi_table = Table(kpi_cells, colWidths=[130, 130, 130, 130])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 14))

        # 3. Insights & Strategic Recommendations
        insights = report_data.get("insights", [])
        recommendations = report_data.get("recommendations", [])

        if insights or recommendations:
            elements.append(Paragraph("Strategic Insights & Recommendations", h2_style))
            ins_items = []
            for ins in insights:
                ins_items.append(Paragraph(f"• <b>Insight:</b> {ins}", body_style))
            for rec in recommendations:
                ins_items.append(Paragraph(f"• <b>Action:</b> {rec}", body_style))
            
            ins_table = Table([[ins_items]], colWidths=[520])
            ins_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ecfdf5")),
                ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#a7f3d0")),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ]))
            elements.append(ins_table)
            elements.append(Spacer(1, 14))

        # 4. Content Performance Table
        tables_data = report_data.get("tables", {})
        content_perf = tables_data.get("content_performance", [])

        elements.append(Paragraph("Content Performance Breakdown", h2_style))
        if content_perf:
            content_rows = [
                [
                    Paragraph("Title", bold_style),
                    Paragraph("Platform", bold_style),
                    Paragraph("Views", bold_style),
                    Paragraph("Likes", bold_style),
                    Paragraph("Engagement", bold_style)
                ]
            ]

            for item in content_perf[:8]:
                content_rows.append([
                    Paragraph(str(item.get("title", ""))[:32], body_style),
                    Paragraph(str(item.get("platform", "")), body_style),
                    Paragraph(f"{item.get('views', 0):,}", body_style),
                    Paragraph(f"{item.get('likes', 0):,}", body_style),
                    Paragraph(f"{item.get('engagement_rate', 0.0):.2f}%", body_style)
                ])

            c_table = Table(content_rows, colWidths=[200, 80, 80, 80, 80])
            c_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                ('TOPPADDING', (0, 0), (-1, 0), 6),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(c_table)
        else:
            elements.append(Paragraph("No content records found in database.", body_style))

        elements.append(Spacer(1, 14))

        # 5. Revenue & Sponsorship Breakdown Table
        revenue_sources = tables_data.get("revenue_by_source", [])
        sponsorships = tables_data.get("sponsorships", [])

        elements.append(Paragraph("Revenue Streams & Sponsorship Deals", h2_style))
        if revenue_sources or sponsorships:
            rev_rows = [
                [
                    Paragraph("Category / Stream / Brand", bold_style),
                    Paragraph("Type", bold_style),
                    Paragraph("Amount (USD)", bold_style),
                    Paragraph("Status / Share", bold_style)
                ]
            ]

            for r in revenue_sources:
                rev_rows.append([
                    Paragraph(str(r.get("source", "")), body_style),
                    Paragraph("Revenue Source", body_style),
                    Paragraph(f"${r.get('amount', 0.0):,.2f}", body_style),
                    Paragraph(f"{r.get('percentage', 0.0):.1f}% Share", body_style)
                ])

            for s in sponsorships[:5]:
                sp_val = s.get('contract_value', s.get('amount', 0.0))
                rev_rows.append([
                    Paragraph(f"{s.get('brand_name')} ({s.get('campaign_name')})", body_style),
                    Paragraph("Sponsorship Deal", body_style),
                    Paragraph(f"${sp_val:,.2f}", body_style),
                    Paragraph(f"{s.get('status')} / {s.get('payment_status')}", body_style)
                ])

            rev_table = Table(rev_rows, colWidths=[200, 100, 110, 110])
            rev_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), ACCENT_COLOR),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                ('TOPPADDING', (0, 0), (-1, 0), 6),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(rev_table)
        else:
            elements.append(Paragraph("No revenue or sponsorship records recorded.", body_style))

        elements.append(Spacer(1, 20))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=MUTED, spaceAfter=8))
        elements.append(Paragraph("CreatorIQ Analytics & Revenue Engine • Confidential Creator Report", subtitle_style))

        doc.build(elements)
        pdf_data = buffer.getvalue()
        buffer.close()
        return pdf_data

    @staticmethod
    def generate_excel_report(report_data: Dict[str, Any]) -> bytes:
        """
        Generates a comprehensive multi-sheet Excel workbook (.xlsx) using OpenPyXL.
        Returns bytes stream for binary HTTP response.
        """
        try:
            from openpyxl import Workbook
            from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
            from openpyxl.utils import get_column_letter
        except ImportError as e:
            raise RuntimeError(f"OpenPyXL package is required for Excel exports: {str(e)}")

        wb = Workbook()
        
        HEADER_FILL = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
        
        HEADER_FONT = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        TITLE_FONT = Font(name="Calibri", size=16, bold=True, color="1E3A8A")
        SUBTITLE_FONT = Font(name="Calibri", size=10, italic=True, color="64748B")
        BOLD_FONT = Font(name="Calibri", size=10, bold=True)
        REGULAR_FONT = Font(name="Calibri", size=10)

        THIN_BORDER = Border(
            left=Side(style='thin', color='E2E8F0'),
            right=Side(style='thin', color='E2E8F0'),
            top=Side(style='thin', color='E2E8F0'),
            bottom=Side(style='thin', color='E2E8F0')
        )

        def style_header_row(ws, row_idx):
            for col in range(1, ws.max_column + 1):
                cell = ws.cell(row=row_idx, column=col)
                cell.fill = HEADER_FILL
                cell.font = HEADER_FONT
                cell.alignment = Alignment(horizontal="center", vertical="center")

        def auto_fit_columns(ws):
            for col in ws.columns:
                max_len = 0
                col_letter = get_column_letter(col[0].column)
                for cell in col:
                    if cell.value:
                        val_str = str(cell.value)
                        if len(val_str) > max_len:
                            max_len = len(val_str)
                ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

        # ----------------------------------------------------
        # SHEET 1: Executive Overview & KPIs
        # ----------------------------------------------------
        ws1 = wb.active
        ws1.title = "Executive Overview"

        ws1["A1"] = report_data.get("title", "CreatorIQ Executive Analytics Report")
        ws1["A1"].font = TITLE_FONT
        
        c_info = report_data.get("creator", {})
        ws1["A2"] = f"Creator: {c_info.get('name')} ({c_info.get('email')}) | Generated: {report_data.get('generated_at')}"
        ws1["A2"].font = SUBTITLE_FONT

        ws1.append([])

        ws1.append(["KPI Metric", "Value", "Notes / Category"])
        style_header_row(ws1, 4)

        kpis = report_data.get("kpis", {})
        kpi_list = [
            ("Total Views", kpis.get("total_views", 0), "Aggregated content views"),
            ("Total Revenue", f"${kpis.get('total_revenue', 0.0):,.2f}", "Combined earnings across sources"),
            ("Average Engagement Rate", f"{kpis.get('average_engagement_rate', 0.0):.2f}%", "Views-to-engagement ratio"),
            ("Total Followers", kpis.get("total_followers", 0), "Combined social community"),
            ("Combined Organic Reach", kpis.get("combined_total_reach", 0), "Total cross-platform reach"),
            ("Sponsorship Revenue", f"${kpis.get('total_sponsorship_revenue', 0.0):,.2f}", "Verified brand deal payouts"),
            ("Top Platform", kpis.get("best_platform", "YouTube"), "Highest performing channel"),
            ("Total Content Items", kpis.get("total_content_items", 0), "Published videos & posts")
        ]

        for metric, val, notes in kpi_list:
            row_num = ws1.max_row + 1
            ws1.append([metric, val, notes])
            ws1.cell(row=row_num, column=1).font = BOLD_FONT
            ws1.cell(row=row_num, column=2).font = BOLD_FONT
            ws1.cell(row=row_num, column=3).font = REGULAR_FONT
            for col in range(1, 4):
                ws1.cell(row=row_num, column=col).border = THIN_BORDER

        ws1.append([])
        ws1.append(["Strategic Insights & Action Items"])
        ws1.cell(row=ws1.max_row, column=1).font = TITLE_FONT

        for ins in report_data.get("insights", []):
            ws1.append(["• Insight:", ins])
            ws1.cell(row=ws1.max_row, column=1).font = BOLD_FONT
            ws1.cell(row=ws1.max_row, column=2).font = REGULAR_FONT

        for rec in report_data.get("recommendations", []):
            ws1.append(["• Action:", rec])
            ws1.cell(row=ws1.max_row, column=1).font = BOLD_FONT
            ws1.cell(row=ws1.max_row, column=2).font = REGULAR_FONT

        auto_fit_columns(ws1)

        # ----------------------------------------------------
        # SHEET 2: Content Performance
        # ----------------------------------------------------
        ws2 = wb.create_sheet(title="Content Performance")
        ws2.append(["ID", "Title", "Platform", "Format", "Views", "Likes", "Comments", "Shares", "Engagement Rate (%)", "Published Date"])
        style_header_row(ws2, 1)

        contents = report_data.get("tables", {}).get("content_performance", [])
        for c in contents:
            ws2.append([
                c.get("id"),
                c.get("title"),
                c.get("platform"),
                c.get("content_type"),
                c.get("views"),
                c.get("likes"),
                c.get("comments"),
                c.get("shares"),
                c.get("engagement_rate"),
                c.get("published_at")
            ])
            r_idx = ws2.max_row
            for col in range(1, 11):
                ws2.cell(row=r_idx, column=col).border = THIN_BORDER
                ws2.cell(row=r_idx, column=col).font = REGULAR_FONT

        auto_fit_columns(ws2)

        # ----------------------------------------------------
        # SHEET 3: Revenue & Sponsorships
        # ----------------------------------------------------
        ws3 = wb.create_sheet(title="Revenue & Sponsorships")
        
        ws3.append(["Revenue Streams"])
        ws3.cell(row=1, column=1).font = TITLE_FONT
        
        ws3.append(["Source Category", "Amount (USD)", "Contribution Share (%)"])
        style_header_row(ws3, 3)

        rev_sources = report_data.get("tables", {}).get("revenue_by_source", [])
        for r in rev_sources:
            ws3.append([
                r.get("source"),
                r.get("amount"),
                r.get("percentage")
            ])
            r_idx = ws3.max_row
            for col in range(1, 4):
                ws3.cell(row=r_idx, column=col).border = THIN_BORDER
                ws3.cell(row=r_idx, column=col).font = REGULAR_FONT

        ws3.append([])
        ws3.append(["Sponsorship Deals Log"])
        ws3.cell(row=ws3.max_row, column=1).font = TITLE_FONT

        spons_header_row = ws3.max_row + 1
        ws3.append(["Deal ID", "Brand Partner", "Campaign Title", "Contract Amount ($)", "Campaign Status", "Payout Status", "Start Date", "End Date"])
        style_header_row(ws3, spons_header_row)

        sponsorships = report_data.get("tables", {}).get("sponsorships", [])
        for s in sponsorships:
            ws3.append([
                s.get("id"),
                s.get("brand_name"),
                s.get("campaign_name"),
                s.get("contract_value", s.get("amount", 0.0)),
                s.get("status"),
                s.get("payment_status"),
                s.get("start_date"),
                s.get("end_date")
            ])
            r_idx = ws3.max_row
            for col in range(1, 9):
                ws3.cell(row=r_idx, column=col).border = THIN_BORDER
                ws3.cell(row=r_idx, column=col).font = REGULAR_FONT

        auto_fit_columns(ws3)

        # ----------------------------------------------------
        # SHEET 4: Platform Comparison
        # ----------------------------------------------------
        ws4 = wb.create_sheet(title="Platform Comparison")
        ws4.append(["Platform", "Followers / Subscribers", "Total Views", "Engagement Rate (%)", "Content Share (%)"])
        style_header_row(ws4, 1)

        platforms = report_data.get("tables", {}).get("platform_performance", [])
        for p in platforms:
            ws4.append([
                p.get("platform"),
                p.get("followers"),
                p.get("views"),
                p.get("engagement_rate"),
                p.get("share")
            ])
            r_idx = ws4.max_row
            for col in range(1, 6):
                ws4.cell(row=r_idx, column=col).border = THIN_BORDER
                ws4.cell(row=r_idx, column=col).font = REGULAR_FONT

        auto_fit_columns(ws4)

        buffer = io.BytesIO()
        wb.save(buffer)
        excel_data = buffer.getvalue()
        buffer.close()
        return excel_data
