import { useEffect, useState } from "react";
import { BarChart3, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import api from "../../api/client";
import { LoadingState, ErrorState, EmptyState } from "../../components/StatusMessage";
import { formatNumber, platformColor } from "../../components/admin/AdminUiKit";

const formatPercent = (value) => `${Number(value ?? 0).toFixed(2)}%`;

export default function AdminComparison() {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      // No creator_id — an Administrator omitting it sees the aggregate
      // across every creator, on every platform.
      const res = await api.get("/analytics/platform-performance");
      setPerformance(res.data ?? []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't load the cross-platform comparison. Make sure you're signed in as an Administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingState label="Loading cross-platform comparison..." />;
  if (error) return <ErrorState message={error} />;

  const chartData = performance.map((p) => ({ ...p, fill: platformColor(p.platform) }));

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-2 text-white shadow-lg shadow-amber-500/30">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cross-Platform Comparison</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <Sparkles size={12} /> Administrator
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Views, likes, comments, reach and engagement — aggregated across every creator, per platform.
          </p>
        </div>

        <button
          onClick={load}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {performance.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <EmptyState message="No platform performance data is available yet." />
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Total Views by Platform</h2>
            <p className="mb-4 text-sm text-slate-400">Across every creator on the platform</p>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="platform" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) =>
                    value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
                  }
                />
                <Tooltip formatter={(value) => [`${formatNumber(value)} views`, "Views"]} />
                <Bar dataKey="total_views" radius={[7, 7, 0, 0]} maxBarSize={65}>
                  {chartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Full Comparison Table</h2>
              <p className="text-xs text-slate-400 mt-1">Every metric, side by side</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left font-medium text-slate-500 px-5 py-3">Platform</th>
                    <th className="text-right font-medium text-slate-500 px-4 py-3">Views</th>
                    <th className="text-right font-medium text-slate-500 px-4 py-3">Likes</th>
                    <th className="text-right font-medium text-slate-500 px-4 py-3">Comments</th>
                    <th className="text-right font-medium text-slate-500 px-4 py-3">Reach</th>
                    <th className="text-right font-medium text-slate-500 px-5 py-3">Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performance.map((row) => (
                    <tr key={row.platform} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800">{row.platform}</span>
                      </td>
                      <td className="text-right px-4 py-4 text-slate-600">{formatNumber(row.total_views)}</td>
                      <td className="text-right px-4 py-4 text-slate-600">{formatNumber(row.total_likes)}</td>
                      <td className="text-right px-4 py-4 text-slate-600">{formatNumber(row.total_comments)}</td>
                      <td className="text-right px-4 py-4 text-slate-600">{formatNumber(row.total_reach)}</td>
                      <td className="text-right px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-brand-600">
                          <TrendingUp size={14} />
                          {formatPercent(row.average_engagement_rate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
