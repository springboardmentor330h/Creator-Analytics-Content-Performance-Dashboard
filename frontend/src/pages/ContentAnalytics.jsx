import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import PageState from "../components/PageState";
import { getSummary, getTopContent, getEngagementChart } from "../api/content";

export default function ContentAnalytics() {
  const [summary, setSummary] = useState(null);
  const [topContent, setTopContent] = useState([]);
  const [engagementChart, setEngagementChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getSummary(), getTopContent(), getEngagementChart()])
      .then(([summaryRes, topRes, chartRes]) => {
        setSummary(summaryRes);
        setTopContent(topRes);
        setEngagementChart(chartRes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="space-y-6 p-6">
          <h1 className="text-2xl font-semibold">Content Analytics</h1>

          <PageState loading={loading} error={error}>
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard label="Total Content" value={summary?.total_content} />
                <KPICard label="Total Views" value={summary?.total_views} />
                <KPICard label="Total Likes" value={summary?.total_likes} />
                <KPICard label="Engagement Rate" value={summary?.overall_engagement_rate} suffix="%" />
              </div>

              <ChartCard
                title="Engagement Rate Over Time"
                type="line"
                data={engagementChart}
                dataKey="date"
                series={[{ key: "engagement_rate", label: "Engagement %", color: "#4f46e5" }]}
              />

              <DataTable
                title="Top Performing Content"
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