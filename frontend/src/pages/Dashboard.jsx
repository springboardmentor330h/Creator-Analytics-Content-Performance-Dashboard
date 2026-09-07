import { useEffect, useState } from "react";
import { BarChart3, Eye, TrendingUp, Award } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import api from "../api/client";
import Card from "../components/Card";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusMessage";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/analytics/summary"),
      api.get("/analytics/platform-performance"),
    ])
      .then(([summaryRes, platformRes]) => {
        setSummary(summaryRes.data);
        setPlatforms(platformRes.data);
      })
      .catch(() => setError("Couldn't load dashboard data. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-400">Everything below is computed live from your PostgreSQL data.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Content" value={summary?.total_content ?? 0} icon={BarChart3} />
        <Card title="Total Views" value={(summary?.total_views ?? 0).toLocaleString()} icon={Eye} />
        <Card title="Avg. Engagement" value={`${summary?.average_engagement_rate ?? 0}%`} icon={TrendingUp} />
        <Card title="Best Platform" value={summary?.best_platform ?? "—"} icon={Award} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Platform Performance (Total Views)</h2>
        {platforms.length === 0 ? (
          <EmptyState message="No content synced yet — try the Social Media page." />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={platforms}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total_views" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {summary?.top_content && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Top Performing Content</h2>
          <p className="text-slate-800 mt-2">{summary.top_content}</p>
        </div>
      )}
    </div>
  );
}
