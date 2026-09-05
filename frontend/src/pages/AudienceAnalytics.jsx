import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import PageState from "../components/PageState";
import { getAudienceReport, getGrowthReport } from "../api/audience";

export default function AudienceAnalytics() {
  const [report, setReport] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getAudienceReport(), getGrowthReport()])
      .then(([reportRes, growthRes]) => {
        setReport(reportRes);
        setGrowth(growthRes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Convert { "18-24": 40, "25-34": 60 } style objects into chart-friendly arrays
  const toChartArray = (obj) =>
    obj ? Object.entries(obj).map(([key, value]) => ({ name: key, value })) : [];

  const genderData = toChartArray(report?.gender_distribution);
  const ageData = toChartArray(report?.age_distribution);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="space-y-6 p-6">
          <h1 className="text-2xl font-semibold">Audience Analytics</h1>

          <PageState loading={loading} error={error}>
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard label="Total Followers" value={report?.total_followers} />
                <KPICard label="Total Reach" value={report?.total_reach} />
                <KPICard label="Total Impressions" value={report?.total_impressions} />
                <KPICard label="Top Country" value={report?.top_country} />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ChartCard
                  title="Age Distribution (%)"
                  type="bar"
                  data={ageData}
                  dataKey="name"
                  series={[{ key: "value", label: "Share %", color: "#4f46e5" }]}
                />
                <ChartCard
                  title="Gender Distribution (%)"
                  type="bar"
                  data={genderData}
                  dataKey="name"
                  series={[{ key: "value", label: "Share %", color: "#7c3aed" }]}
                />
              </div>

              <ChartCard
                title="Follower Growth Over Time"
                type="line"
                data={growth}
                dataKey="date"
                series={[{ key: "followers", label: "Followers", color: "#059669" }]}
              />

              <DataTable
                title="Top Cities & Devices"
                columns={[
                  { key: "top_city", label: "Top City" },
                  { key: "top_device", label: "Top Device" },
                ]}
                rows={report ? [{ top_city: report.top_city, top_device: report.top_device }] : []}
              />
            </>
          </PageState>
        </main>
      </div>
    </div>
  );
}