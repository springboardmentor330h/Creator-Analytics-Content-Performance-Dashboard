import { useEffect, useState } from "react";
import api from "../api/axios";
import { LoadingState, ErrorState, EmptyState } from "../components/LoadingState";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Growth() {
  const [growthData, setGrowthData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/analytics/growth"), api.get("/analytics/audience-trends")])
      .then(([g, t]) => { setGrowthData(g.data); setTrendsData(t.data); })
      .catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Growth & Trends</h2>

      <div className="p-6 mb-8 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Follower Growth (30 Days)</h3>
        {growthData.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={growthData}>
              <XAxis dataKey="date" hide /><YAxis />
              <Tooltip contentStyle={{ borderRadius: "12px" }} />
              <Line type="monotone" dataKey="followers" stroke="#16a34a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Reach Trend</h3>
        {trendsData.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendsData}>
              <XAxis dataKey="date" hide /><YAxis />
              <Tooltip contentStyle={{ borderRadius: "12px" }} />
              <Line type="monotone" dataKey="reach" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}