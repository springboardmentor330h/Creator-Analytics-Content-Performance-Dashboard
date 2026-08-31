import { useEffect, useState } from "react";
import api from "../api/axios";
import KpiCard from "../components/KpiCard";
import { LoadingState, ErrorState } from "../components/LoadingState";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, chartRes] = await Promise.all([
          api.get("/analytics/summary"),
          api.get("/analytics/chart/followers"),
        ]);
        setSummary(summaryRes.data);
        const combined = chartRes.data.labels.map((label, i) => ({
          date: label,
          followers: chartRes.data.values[i],
        }));
        setChartData(combined);
      } catch (err) {
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
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total Views" value={summary.total_views.toLocaleString()} />
        <KpiCard label="Total Likes" value={summary.total_likes.toLocaleString()} />
        <KpiCard label="Total Reach" value={summary.total_reach.toLocaleString()} />
        <KpiCard label="Followers" value={summary.total_followers.toLocaleString()} />
        <KpiCard label="Total Comments" value={summary.total_comments.toLocaleString()} />
        <KpiCard label="Total Shares" value={summary.total_shares.toLocaleString()} />
        <KpiCard
          label="Avg Engagement Rate"
          value={`${summary.average_engagement_rate}%`}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="font-semibold mb-4">Follower Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" hide />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="followers" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}