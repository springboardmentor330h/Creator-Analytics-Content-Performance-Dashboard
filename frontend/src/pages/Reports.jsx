import { useState } from "react";
import {
  getDashboardReport,
  downloadPdfReport,
  downloadExcelReport,
} from "../services/api";
import {
  FileText,
  Download,
  FileSpreadsheet,
  Eye,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReport = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await getDashboardReport();
      setReport(data);
      setMessage("Latest analytics compiled successfully.");
    } catch (err) {
      console.error("Report API error:", err);
      setError("Unable to load report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      setMessage("");
      setError("");

      const blob = await downloadPdfReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "creator_report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage("PDF report downloaded successfully.");
    } catch (err) {
      console.error("PDF download error:", err);
      setError("Unable to download PDF report.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const downloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      setMessage("");
      setError("");

      const blob = await downloadExcelReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "creator_report.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage("Excel spreadsheet downloaded successfully.");
    } catch (err) {
      console.error("Excel download error:", err);
      setError("Unable to download Excel report.");
    } finally {
      setDownloadingExcel(false);
    }
  };

  const content = report?.content_performance || {};
  const platforms = report?.platform_comparison || [];
  const revenue = report?.revenue_analytics || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CreatorIQ Reports & Exports</h1>
        <p className="text-sm text-slate-500 mt-1">Generate comprehensive cross-channel analytics dossiers for sponsors, agencies, and audits</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* View Report */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Compile Live Report</h3>
            <p className="text-xs text-slate-500 mt-1">Aggregate all content, audience, and revenue data into an on-screen preview.</p>
          </div>
          <button
            onClick={loadReport}
            disabled={loading}
            className="mt-4 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {loading ? "Compiling..." : "View Report"}
          </button>
        </div>

        {/* PDF Export */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Export PDF Report</h3>
            <p className="text-xs text-slate-500 mt-1">Download a formatted, professional PDF summary document ready for presentation.</p>
          </div>
          <button
            onClick={downloadPdf}
            disabled={downloadingPdf}
            className="mt-4 w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingPdf ? "Generating PDF..." : "Download PDF"}
          </button>
        </div>

        {/* Excel Export */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Export Excel Sheet</h3>
            <p className="text-xs text-slate-500 mt-1">Download raw multi-sheet XLSX dataset for deep spreadsheet modeling and accounting.</p>
          </div>
          <button
            onClick={downloadExcel}
            disabled={downloadingExcel}
            className="mt-4 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingExcel ? "Exporting XLSX..." : "Download Excel"}
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Compiled Report Preview */}
      {report && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Compiled Dossier Overview
              </h2>
              <p className="text-xs text-slate-500">Creator ID: #{report.creator_id}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              Verified Dossier
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500">Total Content</div>
              <div className="text-lg font-bold text-slate-800">{content.total_content ?? 0}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500">Total Views</div>
              <div className="text-lg font-bold text-slate-800">{Number(content.total_views ?? 0).toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500">Total Likes</div>
              <div className="text-lg font-bold text-slate-800">{Number(content.total_likes ?? 0).toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500">Total Comments</div>
              <div className="text-lg font-bold text-slate-800">{Number(content.total_comments ?? 0).toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500">Total Reach</div>
              <div className="text-lg font-bold text-slate-800">{Number(content.total_reach ?? 0).toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500">Total Revenue</div>
              <div className="text-lg font-bold text-slate-800">₹{Number(revenue.total_revenue ?? 0).toLocaleString()}</div>
            </div>
          </div>

          {/* Platform Performance Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Platform Comparison</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Platform</th>
                    <th className="px-4 py-2.5">Content Posts</th>
                    <th className="px-4 py-2.5">Views</th>
                    <th className="px-4 py-2.5">Reach</th>
                    <th className="px-4 py-2.5">Engagement Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {platforms.map((p) => (
                    <tr key={p.platform}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{p.platform}</td>
                      <td className="px-4 py-3 text-slate-600">{p.content_count}</td>
                      <td className="px-4 py-3 text-slate-800">{Number(p.total_views).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-800">{Number(p.total_reach).toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">{p.engagement_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
