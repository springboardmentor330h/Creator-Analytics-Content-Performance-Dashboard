import io
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_pdf_report(report_data: dict) -> io.BytesIO:
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    p.setFont("Helvetica-Bold", 18)
    p.drawString(100, 750, f"CreatorIQ Performance Report: {report_data['creator']['name']}")
    
    p.setFont("Helvetica", 12)
    p.drawString(100, 710, f"Email: {report_data['creator']['email']}")
    p.drawString(100, 680, "--- Content Performance ---")
    p.drawString(100, 660, f"Total Views: {report_data['content_summary']['total_views']}")
    p.drawString(100, 640, f"Total Likes: {report_data['content_summary']['total_likes']}")
    p.drawString(100, 620, f"Total Comments: {report_data['content_summary']['total_comments']}")
    
    p.drawString(100, 580, "--- Revenue Summary ---")
    p.drawString(100, 560, f"Direct Revenue: ${report_data['revenue_summary']['total_direct_revenue']:,.2f}")
    p.drawString(100, 540, f"Sponsorship Value: ${report_data['revenue_summary']['total_sponsorship_value']:,.2f}")
    p.drawString(100, 520, f"Combined Total: ${report_data['revenue_summary']['combined_total']:,.2f}")
    
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer

def generate_excel_report(report_data: dict) -> io.BytesIO:
    buffer = io.BytesIO()
    
    content_df = pd.DataFrame([report_data["content_summary"]])
    revenue_df = pd.DataFrame([report_data["revenue_summary"]])
    
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        content_df.to_excel(writer, sheet_name="Content Performance", index=False)
        revenue_df.to_excel(writer, sheet_name="Revenue Summary", index=False)
        
    buffer.seek(0)
    return buffer