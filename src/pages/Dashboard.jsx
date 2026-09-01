import { useEffect, useState } from "react";
import { getDashboardReport } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Video,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Users,
  TrendingUp,
  RefreshCw,
  Award,
} from "lucide-react";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getDashboardReport();
      setData(result);
    } catch (err) {
      console.error("Dashboard API error:", err);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading CreatorIQ dashboard analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-xl text-center max-w-lg mx-auto mt-8">
        <h3 className="text-lg font-bold text-rose-800 mb-2">Dashboard Error</h3>
        <p className="text-sm text-rose-600 mb-4">{error}</p>
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-rose-700 transition"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const content = data?.content_performance || {};
  const platforms = data?.platform_comparison || [];

  const cards = [
    {
      title: "Total Content",
      value: content.total_content ?? 0,
      icon: Video,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Total Views",
      value: content.total_views ?? 0,
      icon: Eye,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      title: "Total Likes",
      value: content.total_likes ?? 0,
      icon: Heart,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      title: "Total Comments",
      value: content.total_comments ?? 0,
      icon: MessageSquare,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Total Shares",
      value: content.total_shares ?? 0,
      icon: Share2,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Total Reach",
      value: content.total_reach ?? 0,
      icon: Users,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CreatorIQ Performance Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Cross-platform content reach, audience engagement, and distribution metrics</p>
        </div>
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-xs self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">{card.title}</span>
                <div className={`p-1.5 rounded-lg border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {Number(card.value).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views by Platform Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" /> Views by Platform
            </h2>
            <span className="text-xs font-medium text-slate-400">Total volume</span>
          </div>

          {platforms.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">No platform data available.</p>
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platforms} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="platform" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="total_views" name="Views" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Engagement Rate Line Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Engagement Rate (%)
            </h2>
            <span className="text-xs font-medium text-slate-400">Platform efficiency</span>
          </div>

          {platforms.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">No engagement data available.</p>
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={platforms} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="platform" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement_rate"
                    name="Engagement Rate (%)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Platform Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Platform Performance Matrix
          </h2>
          <span className="text-xs font-medium text-slate-400">{platforms.length} Channels Connected</span>
        </div>

        {platforms.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No platform data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Platform</th>
                  <th className="px-6 py-3.5">Content Count</th>
                  <th className="px-6 py-3.5">Total Views</th>
                  <th className="px-6 py-3.5">Total Reach</th>
                  <th className="px-6 py-3.5">Engagement Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {platforms.map((p) => (
                  <tr key={p.platform} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                      {p.platform}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{p.content_count ?? 0}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {Number(p.total_views ?? 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {Number(p.total_reach ?? 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.engagement_rate ?? 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
