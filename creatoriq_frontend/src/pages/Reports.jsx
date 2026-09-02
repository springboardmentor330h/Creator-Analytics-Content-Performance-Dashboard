import { useState } from "react";
import api from "../services/api";

function Reports() {
  const creatorId = 2;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/reports/creator/${creatorId}`);
      setReport(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load creator report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await api.get(`/reports/export/pdf/${creatorId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `creator_${creatorId}_report.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Unable to download PDF report.");
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await api.get(`/reports/export/excel/${creatorId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `creator_${creatorId}_report.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Unable to download Excel report.");
    }
  };

  return (
    <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="dashboard-hero">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">CreatorIQ Reporting</p>
              <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Reports</h1>
              <p className="mt-2 text-sm text-indigo-100/90">Generate and download analytics reports for Creator {creatorId}.</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Creator #{creatorId}
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="stat-card stat-card-indigo">
            <p className="text-sm font-medium text-indigo-100">Creator</p>
            <h2 className="mt-5 text-3xl font-bold text-white">#{creatorId}</h2>
            <p className="mt-2 text-sm text-indigo-100/90">Connected</p>
          </div>

          <div className="stat-card stat-card-sky">
            <p className="text-sm font-medium text-sky-50">Generate Report</p>
            <button onClick={fetchReport} disabled={loading} className="mt-5 w-full rounded-xl bg-white/15 px-4 py-3 font-semibold text-white transition hover:bg-white/20 disabled:opacity-50">
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>

          <div className="stat-card stat-card-emerald">
            <p className="text-sm font-medium text-emerald-50">Export</p>
            <div className="mt-5 flex gap-2">
              <button onClick={downloadPdf} className="flex-1 rounded-xl bg-white/15 px-3 py-3 text-sm font-semibold text-white hover:bg-white/20">PDF</button>
              <button onClick={downloadExcel} className="flex-1 rounded-xl bg-white/15 px-3 py-3 text-sm font-semibold text-white hover:bg-white/20">Excel</button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">{error}</div>
        )}

        {report && (
          <div className="content-table-card">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Creator Analytics Report</h2>
                <p className="mt-1 text-sm text-slate-500">Report type: {report.report_type}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">Generated</span>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-800">Revenue Analytics</h3>
              {report.revenue?.revenue_summary && (
                <div className="mt-4 rounded-[22px] border border-violet-200 bg-violet-50/70 p-5">
                  <p className="text-sm text-slate-500">Total Revenue</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">₹{Number(report.revenue.revenue_summary.total_revenue || 0).toLocaleString("en-IN")}</p>
                </div>
              )}
            </div>

            {report.revenue?.revenue_by_source?.revenue_by_source && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-800">Revenue by Source</h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="dashboard-table w-full text-left">
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.revenue.revenue_by_source.revenue_by_source.map((item, index) => (
                        <tr key={index}>
                          <td>{item.source}</td>
                          <td>₹{Number(item.amount || 0).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {!report && !loading && !error && (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-12 text-center shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <h2 className="text-xl font-semibold text-slate-800">No report generated yet</h2>
            <p className="mt-2 text-slate-500">Click “Generate Report” to load your creator analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;