import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  Layers,
  Eye,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Trophy,
  BarChart3,
  Activity,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import api from "../../api/client";
import SpotlightCard from "../../components/SpotlightCard";
import { LoadingState, ErrorState, EmptyState } from "../../components/StatusMessage";
import { formatNumber, ROLE_CHART_COLORS } from "../../components/admin/AdminUiKit";

export default function AdminOverview() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/overview");
      setOverview(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't load the platform overview. Make sure you're signed in as an Administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingState label="Loading overview..." />;
  if (error) return <ErrorState message={error} />;

  const roleChartData = Object.entries(overview?.role_breakdown || {}).map(([role, count]) => ({
    name: role,
    value: count,
  }));

  const quickLinks = [
    { to: "/admin/users", label: "Users & Roles", icon: Users, glow: "99, 102, 241", desc: "Promote, suspend, or remove accounts" },
    { to: "/admin/creators", label: "Top Creators", icon: Trophy, glow: "245, 158, 11", desc: "Ranked by total views" },
    { to: "/admin/content", label: "Top Content by Platform", icon: Layers, glow: "16, 185, 129", desc: "Best engagement, per platform" },
    { to: "/admin/comparison", label: "Cross-Platform Comparison", icon: BarChart3, glow: "14, 165, 233", desc: "Aggregate metrics side by side" },
    { to: "/admin/activity", label: "Recent Activity", icon: Activity, glow: "236, 72, 153", desc: "Newest signups on the platform" },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-2 text-white shadow-lg shadow-amber-500/30">
              <ShieldCheck size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Overview</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <Sparkles size={12} /> Administrator
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Platform-wide snapshot across every creator and connected platform.</p>
        </div>

        <button
          onClick={load}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SpotlightCard className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{formatNumber(overview?.total_users)}</p>
              <p className="mt-1 text-xs text-slate-400">
                {overview?.active_users} active · {overview?.inactive_users} suspended
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 transition-transform duration-200 group-hover:scale-110">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard glowColor="16, 185, 129" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Creators With Content</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{formatNumber(overview?.total_creators_with_content)}</p>
              <p className="mt-1 text-xs text-slate-400">{overview?.connected_platforms} platforms connected</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 transition-transform duration-200 group-hover:scale-110">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard glowColor="14, 165, 233" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Views</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{formatNumber(overview?.total_views)}</p>
              <p className="mt-1 text-xs text-slate-400">{formatNumber(overview?.total_content)} pieces of content</p>
            </div>
            <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600 transition-transform duration-200 group-hover:scale-110">
              <Eye className="h-5 w-5" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard glowColor="245, 158, 11" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Engagement</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{overview?.average_engagement_rate ?? 0}%</p>
              <p className="mt-1 text-xs text-slate-400">Across all platforms</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 transition-transform duration-200 group-hover:scale-110">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* ROLE DISTRIBUTION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Role Distribution</h2>
        <p className="text-sm text-slate-400">Who has access to what, right now</p>

        {roleChartData.length === 0 ? (
          <EmptyState message="No users yet." />
        ) : (
          <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row">
            <ResponsiveContainer width="100%" height={180} className="sm:!w-1/2">
              <PieChart>
                <Pie data={roleChartData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {roleChartData.map((entry) => (
                    <Cell key={entry.name} fill={ROLE_CHART_COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} users`, name]} />
              </PieChart>
            </ResponsiveContainer>

            <div className="w-full flex-1 space-y-2">
              {roleChartData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: ROLE_CHART_COLORS[entry.name] || "#94a3b8" }}
                    />
                    {entry.name}
                  </span>
                  <span className="font-semibold text-slate-800">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QUICK LINKS */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Jump to a section</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map(({ to, label, icon: Icon, glow, desc }) => (
            <SpotlightCard
              key={to}
              glowColor={glow}
              onClick={() => navigate(to)}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-50 p-2.5 text-slate-600 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </div>
  );
}
