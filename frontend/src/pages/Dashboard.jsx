import { useEffect, useState } from "react";
import { getDashboardReport } from "../services/api";
import PlatformSelector, { PLATFORMS } from "../components/PlatformSelector";
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
  Area,
  AreaChart,
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
  Sparkles,
  ArrowUpRight,
  Flame,
  Zap,
} from "lucide-react";

function Dashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async (platform = selectedPlatform) => {
    try {
      setLoading(true);
      setError("");
      const result = await getDashboardReport(platform);
      setData(result);
    } catch (err) {
      console.error("Dashboard API error:", err);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(selectedPlatform);
  }, [selectedPlatform]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading CreatorIQ multi-platform analytics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 bg-rose-50/80 border border-rose-200 rounded-2xl text-center max-w-lg mx-auto mt-8 shadow-xs">
        <h3 className="text-lg font-bold text-rose-800 mb-2">Analytics Engine Offline</h3>
        <p className="text-xs text-rose-600 mb-4">{error}</p>
        <button
          onClick={() => loadDashboard(selectedPlatform)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-rose-700 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Reconnect
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
      change: "+4 this week",
      icon: Video,
      gradient: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50/60 border-blue-100/80",
    },
    {
      title: "Total Views",
      value: content.total_views ?? 0,
      change: "+24.8%",
      icon: Eye,
      gradient: "from-indigo-500 to-purple-600",
      bgLight: "bg-indigo-50/60 border-indigo-100/80",
    },
    {
      title: "Total Likes",
      value: content.total_likes ?? 0,
      change: "+18.2%",
      icon: Heart,
      gradient: "from-rose-500 to-pink-600",
      bgLight: "bg-rose-50/60 border-rose-100/80",
    },
    {
      title: "Total Comments",
      value: content.total_comments ?? 0,
      change: "+12.4%",
      icon: MessageSquare,
      gradient: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50/60 border-amber-100/80",
    },
    {
      title: "Total Shares",
      value: content.total_shares ?? 0,
      change: "+31.0%",
      icon: Share2,
      gradient: "from-violet-500 to-indigo-600",
      bgLight: "bg-violet-50/60 border-violet-100/80",
    },
    {
      title: "Total Reach",
      value: content.total_reach ?? 0,
      change: "+27.5%",
      icon: Users,
      gradient: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50/60 border-emerald-100/80",
    },
  ];

  return (
    <div className="space-y-7 pb-16">
      {/* Page Header with Platform Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Multi-Platform Performance Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedPlatform === "All" ? "Combined 6 Channels" : selectedPlatform}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Unified performance telemetry, audience conversion rates, and comparative channel intelligence.
          </p>
        </div>

        <button
          onClick={() => loadDashboard(selectedPlatform)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Platform Selector */}
      <PlatformSelector selectedPlatform={selectedPlatform} onSelectPlatform={setSelectedPlatform} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${card.gradient} flex items-center justify-center text-white shadow-xs`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {Number(card.value).toLocaleString()}
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] font-bold text-emerald-600">
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  <span>{card.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views by Platform Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Audience Views by Platform</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Total content view distribution</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
              Live Volume
            </span>
          </div>

          {platforms.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">No platform data available.</p>
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platforms} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="platform" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12px",
                      padding: "8px 12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                    }}
                  />
                  <Bar dataKey="total_views" name="Total Views" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Engagement Rate Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Engagement Efficiency (%)</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Interactions divided by reach</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
              <Flame className="w-3 h-3 text-emerald-500" /> Top: TikTok & IG
            </span>
          </div>

          {platforms.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">No engagement data available.</p>
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={platforms} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="platform" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12px",
                      padding: "8px 12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement_rate"
                    name="Engagement Rate (%)"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#engagementGradient)"
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Platform Performance Comparison Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Multi-Platform Performance Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side benchmarking of content volume, impressions, and conversion velocity across channels
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {platforms.length} Platforms Live
          </span>
        </div>

        {platforms.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No platform comparison data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5">Rank & Platform</th>
                  <th className="px-6 py-3.5">Published Posts</th>
                  <th className="px-6 py-3.5">Total Views</th>
                  <th className="px-6 py-3.5">Total Likes</th>
                  <th className="px-6 py-3.5">Total Comments</th>
                  <th className="px-6 py-3.5">Audience Reach</th>
                  <th className="px-6 py-3.5">Engagement Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {platforms.map((p, idx) => {
                  const isHighlighted =
                    selectedPlatform !== "All" &&
                    p.platform.toLowerCase() === selectedPlatform.toLowerCase();

                  return (
                    <tr
                      key={p.platform}
                      className={`transition-colors ${
                        isHighlighted
                          ? "bg-indigo-50/80 font-semibold"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      <td className="px-6 py-4 flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                            idx === 0
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : idx === 1
                              ? "bg-slate-200 text-slate-800 border border-slate-300"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900">{p.platform}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {p.content_count ?? 0} items
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {Number(p.total_views ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {Number(p.total_likes ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {Number(p.total_comments ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {Number(p.total_reach ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {p.engagement_rate ?? 0}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, (p.engagement_rate || 0) * 5)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
