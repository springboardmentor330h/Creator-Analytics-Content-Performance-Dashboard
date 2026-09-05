import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import PageState from "../components/PageState";
import { getRevenueSummary, getRevenueTrend } from "../api/revenue";

// NOTE: Revenue/Sponsorship/Notifications/Reports backend endpoints expect
// an integer creator_id, matching the seeded test data (creator_id 1-20)
// from earlier sprints. The logged-in user's id is a UUID, which doesn't
// match that scheme yet, so we use a fixed test creator_id here for now.
const TEST_CREATOR_ID = 1;

export default function Revenue() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getRevenueSummary(TEST_CREATOR_ID), getRevenueTrend(TEST_CREATOR_ID)])
      .then(([summaryRes, trendRes]) => {
        setSummary(summaryRes);
        setTrend(trendRes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const sourceRows = summary?.revenue_by_source
    ? Object.entries(summary.revenue_by_source).map(([source, amount]) => ({ source, amount }))
    : [];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="space-y-6 p-6">
          <h1 className="text-2xl font-semibold">Revenue</h1>

          <PageState loading={loading} error={error}>
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <KPICard label="Total Revenue" value={summary?.total_revenue} suffix=" USD" />
                <KPICard label="Revenue Sources" value={sourceRows.length} />
                <KPICard label="Months Tracked" value={summary?.monthly_revenue?.length} />
              </div>

              <ChartCard
                title="Monthly Revenue"
                type="bar"
                data={summary?.monthly_revenue}
                dataKey="month"
                series={[{ key: "total_revenue", label: "Revenue", color: "#059669" }]}
              />

              <ChartCard
                title="Revenue Trend (Month-over-Month)"
                type="line"
                data={trend}
                dataKey="month"
                series={[{ key: "change_percentage", label: "Change %", color: "#dc2626" }]}
              />

              <DataTable
                title="Revenue by Source"
                columns={[
                  { key: "source", label: "Source" },
                  { key: "amount", label: "Amount (USD)" },
                ]}
                rows={sourceRows}
              />
            </>
          </PageState>
        </main>
      </div>
    </div>
  );
}