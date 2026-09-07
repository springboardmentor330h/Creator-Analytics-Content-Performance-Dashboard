import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import PageState from "../components/PageState";
import {
  getSummary,
  getTopContent,
  getEngagementChart,
  getAvailablePlatforms,
} from "../api/content";

export default function ContentAnalytics() {
  const [summary, setSummary] = useState(null);
  const [topContent, setTopContent] = useState([]);
  const [engagementChart, setEngagementChart] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the list of available platforms once, for the dropdown.
  useEffect(() => {
    getAvailablePlatforms()
      .then(setPlatforms)
      .catch(() => {}); // non-critical if this fails
  }, []);

  // Reload data whenever the selected platform changes.
  useEffect(() => {
    setLoading(true);
    const platformFilter = selectedPlatform === "All" ? undefined : selectedPlatform;

    Promise.all([
      getSummary(platformFilter),
      getTopContent(platformFilter),
      getEngagementChart(platformFilter),
    ])
      .then(([summaryRes, topRes, chartRes]) => {
        setSummary(summaryRes);
        setTopContent(topRes);
        setEngagementChart(chartRes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedPlatform]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Content Analytics</h1>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="rounded border px-3 py-2 text-sm"
            >
              <option value="All">All Platforms</option>
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <PageState loading={loading} error={error}>
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard label="Total Content" value={summary?.total_content} />
                <KPICard label="Total Views" value={summary?.total_views} />
                <KPICard label="Total Likes" value={summary?.total_likes} />
                <KPICard label="Engagement Rate" value={summary?.overall_engagement_rate} suffix="%" />
              </div>

              <ChartCard
                title={`Engagement Rate Over Time — ${selectedPlatform}`}
                type="line"
                data={engagementChart}
                dataKey="date"
                series={[{ key: "engagement_rate", label: "Engagement %", color: "#4f46e5" }]}
              />

              <DataTable
                title={`Top Performing Content — ${selectedPlatform}`}
                columns={[
                  { key: "content_title", label: "Title" },
                  { key: "platform", label: "Platform" },
                  { key: "views", label: "Views" },
                  { key: "engagement_rate", label: "Engagement %" },
                ]}
                rows={topContent}
              />
            </>
          </PageState>
        </main>
      </div>
    </div>
  );
}