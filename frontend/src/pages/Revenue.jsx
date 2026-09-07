import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusMessage";

export default function Revenue() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/revenue/creator/${user.id}/summary`),
      api.get(`/revenue/creator/${user.id}/trend`),
    ])
      .then(([summaryRes, trendRes]) => {
        setSummary(summaryRes.data);
        setTrend(trendRes.data);
      })
      .catch(() => setError("Couldn't load revenue data."))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState label="Loading revenue..." />;
  if (error) return <ErrorState message={error} />;

  const bySource = Object.entries(summary?.by_source ?? {}).map(([name, value]) => ({ name, value }));
  const isUp = trend?.trend === "up";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Revenue</h1>
        <p className="text-sm text-slate-400">Every revenue source, tracked in one place.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card title="Total Revenue" value={`$${(summary?.total_revenue ?? 0).toLocaleString()}`} />
        <Card title="Records" value={summary?.record_count ?? 0} />
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500">Month-over-month</p>
          <div className="flex items-center gap-1 mt-2">
            {trend?.trend === "insufficient_data" ? (
              <span className="text-slate-400 text-sm">Not enough data yet</span>
            ) : (
              <>
                {isUp ? <ArrowUpRight className="text-emerald-500" size={20} /> : <ArrowDownRight className="text-red-500" size={20} />}
                <span className={`text-lg font-semibold ${isUp ? "text-emerald-600" : "text-red-600"}`}>
                  {trend?.change_percent}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Revenue by Source</h2>
        {bySource.length === 0 ? (
          <EmptyState message="No revenue recorded yet." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bySource} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={110} />
              <Tooltip formatter={(v) => `$${v}`} />
              <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {trend?.monthly?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Monthly Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `$${v}`} />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
