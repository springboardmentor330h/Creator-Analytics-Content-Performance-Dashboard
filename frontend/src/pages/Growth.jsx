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
    const fetchData = async () => {
      try {
        const [growthRes, trendsRes] = await Promise.all([
          api.get("/analytics/growth"),
          api.get("/analytics/audience-trends"),
        ]);
        setGrowthData(growthRes.data);
        setTrendsData(trendsRes.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Growth & Trends</h2>

      <div className="p-5 mb-8 bg-white rounded-lg shadow">
        <h3 className="mb-4 font-semibold">Follower Growth (30 Days)</h3>
        {growthData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={growthData}>
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="followers" stroke="#16a34a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="p-5 bg-white rounded-lg shadow">
        <h3 className="mb-4 font-semibold">Reach Trend</h3>
        {trendsData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendsData}>
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="reach" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}