import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import PageState from "../components/PageState";
import { getGrowthReport, getAudienceTrends } from "../api/audience";

export default function GrowthTrends() {
  const [growth, setGrowth] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getGrowthReport(), getAudienceTrends()])
      .then(([growthRes, trendsRes]) => {
        setGrowth(growthRes);
        setTrends(trendsRes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const latest = growth.length > 0 ? growth[growth.length - 1] : null;
  const first = growth.length > 0 ? growth[0] : null;
  const overallGrowth =
    first && latest && first.followers
      ? (((latest.followers - first.followers) / first.followers) * 100).toFixed(2)
      : null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="space-y-6 p-6">
          <h1 className="text-2xl font-semibold">Growth & Trends</h1>

          <PageState loading={loading} error={error}>
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard label="Current Followers" value={latest?.followers} />
                <KPICard label="Latest Daily Growth" value={latest?.daily_growth} />
                <KPICard label="Latest Growth %" value={latest?.growth_percentage} suffix="%" />
                <KPICard label="Overall Growth (period)" value={overallGrowth} suffix="%" />
              </div>

              <ChartCard
                title="Follower & Reach Trend"
                type="line"
                data={trends}
                dataKey="date"
                series={[
                  { key: "followers", label: "Followers", color: "#4f46e5" },
                  { key: "reach", label: "Reach", color: "#f59e0b" },
                ]}
              />

              <DataTable
                title="Daily Growth Log"
                columns={[
                  { key: "date", label: "Date" },
                  { key: "followers", label: "Followers" },
                  { key: "daily_growth", label: "Daily Growth" },
                  { key: "growth_percentage", label: "Growth %" },
                ]}
                rows={growth}
              />
            </>
          </PageState>
        </main>
      </div>
    </div>
  );
}