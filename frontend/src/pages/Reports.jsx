import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICard from "../components/KPICard";
import DataTable from "../components/DataTable";
import PageState from "../components/PageState";
import { generateReport, downloadReportPdf, downloadReportExcel } from "../api/reports";

// See note in Revenue.jsx — fixed test creator_id for now.
const TEST_CREATOR_ID = 1;

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null); // "pdf" | "excel" | null

  const handleGenerate = () => {
    setLoading(true);
    setError(null);
    generateReport(TEST_CREATOR_ID)
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      if (type === "pdf") await downloadReportPdf(TEST_CREATOR_ID);
      else await downloadReportExcel(TEST_CREATOR_ID);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Reports</h1>
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Generating…" : "Generate Report"}
              </button>
              <button
                onClick={() => handleDownload("pdf")}
                disabled={downloading === "pdf"}
                className="rounded border border-indigo-600 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
              >
                {downloading === "pdf" ? "Downloading…" : "Download PDF"}
              </button>
              <button
                onClick={() => handleDownload("excel")}
                disabled={downloading === "excel"}
                className="rounded border border-indigo-600 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
              >
                {downloading === "excel" ? "Downloading…" : "Download Excel"}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">Something went wrong: {error}</p>}

          {!report && !loading && (
            <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-400 shadow">
              Click "Generate Report" to pull together your content, audience, growth, and revenue
              analytics into one report.
            </p>
          )}

          <PageState loading={loading} error={null}>
            <>
              {report && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KPICard label="Total Content" value={report.content_performance?.total_content} />
                    <KPICard label="Total Views" value={report.content_performance?.total_views} />
                    <KPICard label="Total Followers" value={report.audience_analytics?.total_followers} />
                    <KPICard label="Total Revenue" value={report.revenue_analytics?.total_revenue} suffix=" USD" />
                  </div>

                  <DataTable
                    title="Top Content (from this report)"
                    columns={[
                      { key: "content_title", label: "Title" },
                      { key: "platform", label: "Platform" },
                      { key: "views", label: "Views" },
                      { key: "engagement_rate", label: "Engagement %" },
                    ]}
                    rows={report.top_content}
                  />

                  <DataTable
                    title="Platform Comparison (from this report)"
                    columns={[
                      { key: "platform", label: "Platform" },
                      { key: "content_count", label: "Content Count" },
                      { key: "total_views", label: "Total Views" },
                      { key: "avg_engagement_rate", label: "Avg Engagement %" },
                    ]}
                    rows={report.platform_comparison}
                  />
                </>
              )}
            </>
          </PageState>
        </main>
      </div>
    </div>
  );
}