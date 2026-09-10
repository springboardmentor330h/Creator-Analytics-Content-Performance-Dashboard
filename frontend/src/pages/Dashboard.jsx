import { useEffect, useState } from "react";
import {
  BarChart3,
  Eye,
  TrendingUp,
  Award,
  FileText,
  Heart,
  MessageCircle,
  Users,
  ChevronDown,
  Sparkles,
} from "lucide-react";

import {
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

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

import api from "../api/client";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "../components/StatusMessage";


const PLATFORM_OPTIONS = [
  "All Platforms",
  "YouTube",
  "Instagram",
  "TikTok",
  "Facebook",
  "LinkedIn",
  "X",
];


const PLATFORM_CONFIG = {
  YouTube: {
    icon: FaYoutube,
    color: "#FF0000",
    bg: "bg-red-50",
    text: "text-red-600",
  },

  Instagram: {
    icon: FaInstagram,
    color: "#E1306C",
    bg: "bg-pink-50",
    text: "text-pink-600",
  },

  TikTok: {
    icon: FaTiktok,
    color: "#111827",
    bg: "bg-slate-100",
    text: "text-slate-800",
  },

  Facebook: {
    icon: FaFacebook,
    color: "#1877F2",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },

  LinkedIn: {
    icon: FaLinkedin,
    color: "#0A66C2",
    bg: "bg-sky-50",
    text: "text-sky-600",
  },

  X: {
    icon: FaXTwitter,
    color: "#000000",
    bg: "bg-slate-100",
    text: "text-slate-900",
  },
};


function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}


function getPlatformConfig(platform) {
  return (
    PLATFORM_CONFIG[platform] || {
      icon: BarChart3,
      color: "#4f46e5",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    }
  );
}


function PlatformIcon({ platform, size = 20 }) {
  const config = getPlatformConfig(platform);
  const Icon = config.icon;

  return (
    <Icon
      size={size}
      color={config.color}
      aria-label={`${platform} icon`}
    />
  );
}


function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  iconBg = "bg-indigo-50",
  iconColor = "text-indigo-600",
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative z-10 flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div className={`rounded-xl p-2.5 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>

      <div className="absolute -bottom-8 -right-8 h-20 w-20 rounded-full bg-slate-50 transition-transform duration-300 group-hover:scale-150" />
    </div>
  );
}


function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const platform = payload[0]?.payload?.platform;
  const config = getPlatformConfig(platform);

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <div className="mb-1 flex items-center gap-2">
        <PlatformIcon platform={platform} size={16} />

        <p className="text-sm font-semibold text-slate-800">
          {label}
        </p>
      </div>

      <p
        className="text-sm font-semibold"
        style={{ color: config.color }}
      >
        {formatNumber(payload[0].value)} views
      </p>
    </div>
  );
}


function PlatformSelector({
  selectedPlatform,
  setSelectedPlatform,
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <PlatformIcon
          platform={selectedPlatform === "All Platforms" ? "" : selectedPlatform}
          size={19}
        />

        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="w-full appearance-none bg-transparent pr-7 text-sm font-semibold text-slate-700 outline-none lg:w-44"
        >
          {PLATFORM_OPTIONS.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}


export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [topContent, setTopContent] = useState([]);
  const [selectedPlatform, setSelectedPlatform] =
    useState("All Platforms");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const params =
          selectedPlatform === "All Platforms"
            ? {}
            : {
                params: {
                  platform: selectedPlatform,
                },
              };

        const [
          summaryRes,
          platformRes,
          topContentRes,
        ] = await Promise.all([
          api.get("/analytics/summary", params),
          api.get("/analytics/platform-performance", params),
          api.get("/analytics/top-content", params),
        ]);

        if (cancelled) return;

        setSummary(summaryRes.data);
        setPlatforms(platformRes.data);
        setTopContent(topContentRes.data);
      } catch (err) {
        if (!cancelled) {
          setError(
            "Couldn't load dashboard data. Is the backend running?"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [selectedPlatform]);


  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }


  if (error) {
    return <ErrorState message={error} />;
  }


  const isFiltered =
    selectedPlatform !== "All Platforms";


  const totalLikes = platforms.reduce(
    (sum, item) =>
      sum + Number(item.total_likes || 0),
    0
  );


  const totalComments = platforms.reduce(
    (sum, item) =>
      sum + Number(item.total_comments || 0),
    0
  );


  const totalReach = platforms.reduce(
    (sum, item) =>
      sum + Number(item.total_reach || 0),
    0
  );


  const chartData = platforms.map((item) => ({
    ...item,
    fill: getPlatformConfig(item.platform).color,
  }));


  const selectedConfig =
    PLATFORM_CONFIG[selectedPlatform];


  return (
    <div className="space-y-6 pb-8">

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex flex-wrap items-center gap-2">

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
              Live Analytics
            </span>

          </div>

          <p className="mt-1 text-sm text-slate-500">
            Track your content performance across all connected platforms.
          </p>
        </div>


        <PlatformSelector
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
        />

      </div>


      {/* FILTER STATUS */}
      {isFiltered && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">

          <div
            className={`rounded-lg p-2 ${selectedConfig?.bg || "bg-indigo-50"}`}
          >
            <PlatformIcon
              platform={selectedPlatform}
              size={17}
            />
          </div>

          <span className="text-slate-600">
            Showing live analytics for{" "}
            <strong className="text-slate-900">
              {selectedPlatform}
            </strong>
            .
          </span>

          <button
            onClick={() =>
              setSelectedPlatform("All Platforms")
            }
            className="ml-auto font-semibold text-indigo-600 underline underline-offset-2"
          >
            View all
          </button>

        </div>
      )}


      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          title="Total Content"
          value={formatNumber(summary?.total_content)}
          icon={FileText}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          description={
            isFiltered
              ? `Published on ${selectedPlatform}`
              : "Across all platforms"
          }
        />


        <MetricCard
          title="Total Views"
          value={formatNumber(summary?.total_views)}
          icon={Eye}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          description="Combined content views"
        />


        <MetricCard
          title="Avg. Engagement"
          value={`${summary?.average_engagement_rate ?? 0}%`}
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          description="Average engagement rate"
        />


        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

          <div className="relative z-10 flex items-start justify-between">

            <div className="min-w-0">

              <p className="text-sm font-medium text-slate-500">
                Best Platform
              </p>

              <div className="mt-3 flex items-center gap-2">

                {summary?.best_platform && (
                  <PlatformIcon
                    platform={summary.best_platform}
                    size={23}
                  />
                )}

                <p className="truncate text-xl font-bold tracking-tight text-slate-900">
                  {summary?.best_platform || "—"}
                </p>

              </div>

              <p className="mt-1 text-xs text-slate-400">
                {isFiltered
                  ? "Selected platform"
                  : "Highest engagement rate"}
              </p>

            </div>

            <div className="rounded-xl bg-amber-50 p-2.5">
              <Award className="h-5 w-5 text-amber-500" />
            </div>

          </div>

          <div className="absolute -bottom-8 -right-8 h-20 w-20 rounded-full bg-amber-50/50 transition-transform duration-300 group-hover:scale-150" />

        </div>

      </div>


      {/* PLATFORM PERFORMANCE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Platform Performance
            </h2>

            <p className="text-sm text-slate-400">
              Total views by platform
            </p>
          </div>


          <div className="flex items-center gap-2 text-xs text-slate-500">

            {selectedPlatform !== "All Platforms" ? (
              <>
                <PlatformIcon
                  platform={selectedPlatform}
                  size={15}
                />

                <span>{selectedPlatform}</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>All platforms</span>
              </>
            )}

          </div>

        </div>


        {platforms.length === 0 ? (
          <EmptyState message="No content synced yet — try the Social Media page." />
        ) : (
          <ResponsiveContainer width="100%" height={320}>

            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />

              <XAxis
                dataKey="platform"
                tick={{
                  fontSize: 12,
                  fill: "#64748b",
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 12,
                  fill: "#64748b",
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  value >= 1000000
                    ? `${(value / 1000000).toFixed(1)}M`
                    : value >= 1000
                    ? `${(value / 1000).toFixed(0)}K`
                    : value
                }
              />

              <Tooltip content={<CustomTooltip />} />

              <Bar
                dataKey="total_views"
                radius={[7, 7, 0, 0]}
                maxBarSize={55}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={entry.fill}
                  />
                ))}
              </Bar>

            </BarChart>

          </ResponsiveContainer>
        )}

      </div>


      {/* SECONDARY ANALYTICS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ENGAGEMENT OVERVIEW */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">
              Engagement Overview
            </h2>

            <p className="text-sm text-slate-400">
              Audience interactions
            </p>
          </div>


          <div className="space-y-4">

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-rose-50 p-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                </div>

                <span className="text-sm text-slate-600">
                  Likes
                </span>

              </div>

              <span className="font-semibold text-slate-900">
                {formatNumber(totalLikes)}
              </span>

            </div>


            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-blue-50 p-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                </div>

                <span className="text-sm text-slate-600">
                  Comments
                </span>

              </div>

              <span className="font-semibold text-slate-900">
                {formatNumber(totalComments)}
              </span>

            </div>


            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-violet-50 p-2">
                  <Users className="h-4 w-4 text-violet-500" />
                </div>

                <span className="text-sm text-slate-600">
                  Total Reach
                </span>

              </div>

              <span className="font-semibold text-slate-900">
                {formatNumber(totalReach)}
              </span>

            </div>

          </div>

        </div>


        {/* TOP CONTENT */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">

          <div className="mb-5">

            <h2 className="text-base font-semibold text-slate-900">
              Top Performing Content
            </h2>

            <p className="text-sm text-slate-400">
              Ranked by engagement rate
            </p>

          </div>


          {topContent.length === 0 ? (
            <EmptyState message="No content available yet." />
          ) : (
            <div className="space-y-3">

              {topContent.map((content, index) => {

                const config =
                  getPlatformConfig(content.platform);

                return (
                  <div
                    key={`${content.content_title}-${index}`}
                    className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 transition hover:border-indigo-100 hover:bg-indigo-50/30"
                  >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                      <span className="text-sm font-bold text-slate-500">
                        {index + 1}
                      </span>
                    </div>


                    <div className="flex min-w-0 flex-1 items-center gap-3">

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                      >
                        <PlatformIcon
                          platform={content.platform}
                          size={18}
                        />
                      </div>


                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-800">
                          {content.content_title ||
                            "Untitled Content"}
                        </p>

                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">

                          <span>
                            {content.platform}
                          </span>

                          <span>•</span>

                          <span>
                            {formatNumber(content.views)} views
                          </span>

                        </div>

                      </div>

                    </div>


                    <div className="text-right">

                      <p
                        className="text-sm font-bold"
                        style={{ color: config.color }}
                      >
                        {content.engagement_rate ?? 0}%
                      </p>

                      <p className="text-[11px] text-slate-400">
                        engagement
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>


      {/* DATA SOURCE FOOTER */}
      <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">

        <BarChart3 className="h-3.5 w-3.5" />

        <span>
          Analytics calculated from your PostgreSQL content data
        </span>

      </div>

    </div>
  );
}