import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useCreator } from "../context/CreatorContext";

export default function Reports() {
  const { creatorId } = useCreator();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const base = "http://localhost:8000";

  const downloadLinks = [
    { label: "Content Report (PDF)", url: base + "/reports/content/pdf/" + creatorId },
    { label: "Content Report (Excel)", url: base + "/reports/content/excel/" + creatorId },
    { label: "Audience Report (Excel)", url: base + "/reports/audience/excel/" + creatorId },
    { label: "Revenue Report (Excel)", url: base + "/reports/revenue/excel/" + creatorId },
  ];

  useEffect(() => {
    api.get(`/reports/creator/${creatorId}/generate`)
      .then((res) => setReport(res.data))
      .catch((err) => setError(err.response?.status === 403 ? "You can only view your own reports" : "Could not generate report"));
  }, [creatorId]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Reports & Export</h1>
          {error && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

          {report && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Total Views" value={report.content_summary?.total_views?.toLocaleString()} />
              <Stat label="Avg Engagement" value={`${report.content_summary?.average_engagement_rate}%`} />
              <Stat label="Total Revenue" value={`$${report.revenue_summary?.total_earnings?.toLocaleString()}`} />
              <Stat label="Followers" value={report.audience_summary?.total_followers?.toLocaleString()} />
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {downloadLinks.map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="rounded-xl bg-white p-4 shadow hover:bg-indigo-50">
                <p className="font-medium text-indigo-700">{link.label}</p>
                <p className="text-sm text-gray-500">Click to download</p>
              </a>
            ))}
          </div>

          {report && (
            <div className="rounded-xl bg-white p-4 shadow">
              <p className="mb-2 font-medium">Platform Comparison</p>
              {Object.entries(report.platform_comparison || {}).map(([platform, stats]) => (
                <div key={platform} className="flex justify-between border-b py-1 text-sm">
                  <span>{platform}</span>
                  <span>{stats.views.toLocaleString()} views · {stats.engagement_rate}%</span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow sm:p-4">
      <p className="text-xs text-gray-500 sm:text-sm">{label}</p>
      <p className="text-lg font-bold sm:text-2xl">{value}</p>
    </div>
  );
}