import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusMessage";

export default function GrowthTrends() {
  const { user } = useAuth();
  const [trend, setTrend] = useState(null);
  const [byPlatform, setByPlatform] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/analytics/growth/${user.id}`),
      api.get(`/analytics/growth/${user.id}/platform-comparison`),
    ])
      .then(([trendRes, platformRes]) => {
        setTrend(trendRes.data);
        setByPlatform(platformRes.data);
      })
      .catch(() => setError("Couldn't load growth trends."))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState label="Loading growth trends..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Growth & Trends</h1>
        <p className="text-sm text-slate-400">Follower growth over time, across all platforms.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Starting Followers" value={(trend?.starting_followers ?? 0).toLocaleString()} />
        <Card title="Current Followers" value={(trend?.current_followers ?? 0).toLocaleString()} />
        <Card title="Net Change" value={(trend?.net_change ?? 0).toLocaleString()} />
        <Card title="Growth Rate" value={`${trend?.growth_rate_percent ?? 0}%`} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Follower Trend</h2>
        {(trend?.series?.length ?? 0) === 0 ? (
          <EmptyState message="No growth history recorded yet." />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend.series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="follower_count" stroke="#4f46e5" strokeWidth={2} name="Followers" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Per-Platform Growth</h2>
        {byPlatform.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {byPlatform.map((p, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-3">
                <p className="text-sm font-medium text-slate-800">{p.platform}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {p.current_followers?.toLocaleString()} followers ({p.growth_rate_percent}%)
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
