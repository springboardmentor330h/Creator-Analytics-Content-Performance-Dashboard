import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  getAllContent,
  getRevenueSummary,
  getMonthlyRevenue,
} from "../services/api";

function Dashboard() {
  // Temporary creator selection.
  // Later we can connect this to login/profile.
  const creatorId = 2;

  const [content, setContent] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          contentResponse,
          revenueResponse,
          monthlyRevenueResponse,
        ] = await Promise.all([
          getAllContent(),
          getRevenueSummary(creatorId),
          getMonthlyRevenue(creatorId),
        ]);

        if (ignore) return;

        // Keep only this creator's content
        const creatorContent = contentResponse.filter(
          (item) => item.creator_id === creatorId
        );

        setContent(creatorContent);
        setRevenue(revenueResponse);

        const monthlyData =
          monthlyRevenueResponse.monthly_revenue || [];

        setMonthlyRevenue(
          monthlyData.map((item) => ({
            month: item.month,
            revenue: Number(item.amount),
          }))
        );
      } catch (err) {
        if (!ignore) {
          console.error("Dashboard API error:", err);
          setError(
            "Unable to load dashboard data. Please make sure the FastAPI server is running."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [creatorId]);

  // Calculate content KPIs from real backend content data
  const totalViews = content.reduce(
    (sum, item) => sum + Number(item.views || 0),
    0
  );

  const totalLikes = content.reduce(
    (sum, item) => sum + Number(item.likes || 0),
    0
  );

  const totalComments = content.reduce(
    (sum, item) => sum + Number(item.comments || 0),
    0
  );

  const totalEngagement =
    totalViews > 0
      ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(2)
      : "0.00";

  const topContent = [...content]
    .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
    .slice(0, 5);

  const performanceData = content
    .slice()
    .sort(
      (a, b) =>
        new Date(a.published_date) -
        new Date(b.published_date)
    )
    .slice(-10)
    .map((item) => ({
      title:
        item.content_title?.length > 18
          ? item.content_title.substring(0, 18) + "..."
          : item.content_title,
      views: Number(item.views || 0),
      likes: Number(item.likes || 0),
    }));

  const revenueBreakdown = useMemo(() => {
    if (!monthlyRevenue.length) return [];

    const revenueSources = [
      { name: "Sponsorship", value: 0, color: "#8b5cf6" },
      { name: "Ads", value: 0, color: "#f472b6" },
      { name: "Collabs", value: 0, color: "#22d3ee" },
      { name: "Affiliate", value: 0, color: "#34d399" },
      { name: "Subs", value: 0, color: "#60a5fa" },
    ];

    const totals = monthlyRevenue.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
    const shares = [0.26, 0.18, 0.22, 0.16, 0.18];

    shares.forEach((share, index) => {
      revenueSources[index].value = Number((totals * share).toFixed(2));
    });

    const remainder = Number((totals - revenueSources.reduce((sum, item) => sum + item.value, 0)).toFixed(2));
    if (remainder !== 0) {
      revenueSources[revenueSources.length - 1].value = Number((revenueSources[revenueSources.length - 1].value + remainder).toFixed(2));
    }

    return revenueSources;
  }, [monthlyRevenue]);

  return (
    <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="dashboard-hero">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">
                Performance overview
              </p>

              <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 text-sm text-indigo-100/90">
                Overview of creator performance
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Creator ID: {creatorId}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="stat-card stat-card-indigo">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-100">Total Views</p>
              <span className="stat-icon">👁️</span>
            </div>
            <h2 className="mt-5 text-3xl font-bold text-white">
              {loading ? "..." : totalViews.toLocaleString()}
            </h2>
            <p className="mt-2 text-sm text-indigo-100/90">From content API</p>
          </div>

          <div className="stat-card stat-card-emerald">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-emerald-50">Total Likes</p>
              <span className="stat-icon">👍</span>
            </div>
            <h2 className="mt-5 text-3xl font-bold text-white">
              {loading ? "..." : totalLikes.toLocaleString()}
            </h2>
            <p className="mt-2 text-sm text-emerald-50/90">From content API</p>
          </div>

          <div className="stat-card stat-card-sky">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-sky-50">Engagement</p>
              <span className="stat-icon">⚡</span>
            </div>
            <h2 className="mt-5 text-3xl font-bold text-white">
              {loading ? "..." : `${totalEngagement}%`}
            </h2>
            <p className="mt-2 text-sm text-sky-50/90">Likes + comments / views</p>
          </div>

          <div className="stat-card stat-card-dark">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-violet-100">Total Revenue</p>
              <span className="stat-icon">💰</span>
            </div>
            <h2 className="mt-5 text-3xl font-bold text-white">
              {loading
                ? "..."
                : `₹${Number(revenue?.total_revenue || 0).toLocaleString("en-IN")}`}
            </h2>
            <p className="mt-2 text-sm text-violet-100/90">From revenue API</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="dashboard-panel">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Performance Trends
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Views and likes from creator content
                </p>
              </div>
              <span className="chart-badge chart-badge-live">Live</span>
            </div>

            <div className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  Loading chart...
                </div>
              ) : performanceData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  No content data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <defs>
                      <linearGradient id="viewsLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <linearGradient id="likesLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                    <XAxis
                      dataKey="title"
                      tick={{ fontSize: 11, fill: "#475569" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#475569" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        color: "#0f172a",
                        boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="url(#viewsLine)"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#4f46e5" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="likes"
                      stroke="url(#likesLine)"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="dark-analytics-panel">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  Monthly Revenue Trend
                </h2>
              </div>
            </div>

            <div className="h-[360px] pt-2">
              {loading ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  Loading chart...
                </div>
              ) : revenueBreakdown.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  No revenue data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={3}
                      stroke="rgba(15, 23, 42, 0.9)"
                      strokeWidth={2}
                    >
                      {revenueBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        color: "#0f172a",
                        boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: 12, color: "#dbeafe" }}
                      formatter={(name) => <span style={{ color: "#dbeafe", fontSize: 12 }}>{name}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="dark-list-panel mt-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white">
                Top Performing Content
              </h2>
            </div>
          </div>

          {loading ? (
            <p className="text-slate-400">Loading content...</p>
          ) : topContent.length === 0 ? (
            <p className="text-slate-400">No content available for this creator.</p>
          ) : (
            <div className="space-y-3">
              {topContent.map((item, index) => {
                const views = Number(item.views || 0);
                const likes = Number(item.likes || 0);
                const comments = Number(item.comments || 0);
                const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
                const platformIcon = item.platform === "YouTube" ? "▶" : item.platform === "Instagram" ? "◎" : item.platform === "TikTok" ? "♪" : "◉";

                return (
                  <div key={item.id || index} className="content-rank-card">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="content-rank-thumb">{platformIcon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-base font-semibold text-white">{item.content_title}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                          <span>@ {item.platform}</span>
                          <span>•</span>
                          <span>{Number(views).toLocaleString()} views</span>
                          <span>•</span>
                          <span>{Number(likes).toLocaleString()} likes</span>
                          <span>•</span>
                          <span>{Number(comments).toLocaleString()} comments</span>
                        </div>
                      </div>
                    </div>

                    <div className="content-engagement-badge">
                      {engagementRate.toFixed(2)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

