from io import BytesIO
from openpyxl import Workbook
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from app.services.analytics_service import kpi_summary, platform_comparison
from app.services.audience_service import report as audience_report
from app.services.revenue_service import summary as revenue_summary

def build_report(db):
    return {"content":kpi_summary(db),"audience":audience_report(db),
            "revenue":revenue_summary(db),"platform_comparison":platform_comparison(db)}

def pdf_report(data):
    buf=BytesIO(); c=canvas.Canvas(buf,pagesize=A4); y=800
    c.setFont("Helvetica-Bold",16); c.drawString(50,y,"CreatorIQ Analytics Report"); y-=35
    def walk(obj,prefix=""):
        nonlocal y
        if y<60: c.showPage(); y=800
        if isinstance(obj,dict):
            for k,v in obj.items(): walk(v,f"{prefix}{k}: ")
        elif isinstance(obj,list): walk(str(obj),prefix)
        else:
            text=f"{prefix}{obj}"[:110]; c.setFont("Helvetica",9); c.drawString(50,y,text); y-=14
    walk(data); c.save(); buf.seek(0); return buf

def excel_report(data):
    wb=Workbook(); ws=wb.active; ws.title="Summary"
    row=1
    def write_obj(prefix,obj):
        nonlocal row
        if isinstance(obj,dict):
            for k,v in obj.items(): write_obj(f"{prefix}{k}.",v)
        elif isinstance(obj,list):
            ws.cell(row,1,prefix[:-1]); ws.cell(row,2,str(obj)); row+=1
        else:
            ws.cell(row,1,prefix[:-1]); ws.cell(row,2,obj); row+=1
    write_obj("",data); buf=BytesIO(); wb.save(buf); buf.seek(0); return buf
