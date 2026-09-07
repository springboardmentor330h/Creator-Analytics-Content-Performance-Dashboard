import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import PageState from "../components/PageState";
import { getPlatformComparison } from "../api/content";

export default function PlatformComparison() {
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPlatformComparison()
      .then(setComparison)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="space-y-6 p-6">
          <h1 className="text-2xl font-semibold">Platform Comparison</h1>

          <PageState loading={loading} error={error}>
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ChartCard
                  title="Total Views by Platform"
                  type="bar"
                  data={comparison}
                  dataKey="platform"
                  series={[{ key: "total_views", label: "Views", color: "#4f46e5" }]}
                />
                <ChartCard
                  title="Avg Engagement Rate by Platform"
                  type="bar"
                  data={comparison}
                  dataKey="platform"
                  series={[{ key: "avg_engagement_rate", label: "Engagement %", color: "#059669" }]}
                />
              </div>

              <DataTable
                title="Platform Comparison"
                columns={[
                  { key: "platform", label: "Platform" },
                  { key: "content_count", label: "Content Count" },
                  { key: "total_views", label: "Total Views" },
                  { key: "total_likes", label: "Total Likes" },
                  { key: "avg_engagement_rate", label: "Avg Engagement %" },
                ]}
                rows={comparison}
              />
            </>
          </PageState>
        </main>
      </div>
    </div>
  );
}