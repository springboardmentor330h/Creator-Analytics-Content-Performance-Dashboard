import { useEffect, useMemo, useState } from "react";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  getAllContent,
  getRevenueSummary,
  getRevenueTrend,
  getPlatformComparison,
  getPlatformPerformance,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

/*=========================================================
   HELPERS
========================================================= */

const normalizeContentResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  return [];
};

const normalizePlatformResponse = (response) => {
  if (!response) {
    return [];
  }

  /*
   * Backend may return:
   *
   * [
   *   {
   *     platform: "Instagram",
   *     views: 1000,
   *     likes: 100,
   *     comments: 20,
   *     reach: 1200,
   *     avg_engagement: 8.5
   *   }
   * ]
   *
   * OR:
   *
   * {
   *   "Instagram": {...},
   *   "TikTok": {...}
   * }
   */

  if (Array.isArray(response)) {
    return response
      .map((item) => ({
        platform:
          item?.platform ||
          item?.name ||
          item?.platform_name ||
          "Unknown",

        views: Number(
          item?.views ??
            item?.total_views ??
            0
        ),

        likes: Number(
          item?.likes ??
            item?.total_likes ??
            0
        ),

        comments: Number(
          item?.comments ??
            item?.total_comments ??
            0
        ),

        shares: Number(
          item?.shares ??
            item?.total_shares ??
            0
        ),

        saves: Number(
          item?.saves ??
            item?.total_saves ??
            0
        ),

        reach: Number(
          item?.reach ??
            item?.total_reach ??
            0
        ),

        engagement: Number(
          item?.engagement_rate ??
            item?.avg_engagement ??
            item?.average_engagement ??
            0
        ),
      }))
      .filter(
        (item) =>
          item.platform &&
          item.platform !== "Unknown"
      );
  }

  const source =
    response?.platforms &&
    typeof response.platforms === "object"
      ? response.platforms
      : response;

  if (
    source &&
    typeof source === "object" &&
    !Array.isArray(source)
  ) {
    return Object.entries(source)
      .map(([platform, values]) => ({
        platform,

        views: Number(
          values?.views ??
            values?.total_views ??
            0
        ),

        likes: Number(
          values?.likes ??
            values?.total_likes ??
            0
        ),

        comments: Number(
          values?.comments ??
            values?.total_comments ??
            0
        ),

        shares: Number(
          values?.shares ??
            values?.total_shares ??
            0
        ),

        saves: Number(
          values?.saves ??
            values?.total_saves ??
            0
        ),

        reach: Number(
          values?.reach ??
            values?.total_reach ??
            0
        ),

        engagement: Number(
          values?.engagement_rate ??
            values?.avg_engagement ??
            values?.average_engagement ??
            0
        ),
      }))
      .filter(
        (item) =>
          item.platform &&
          item.platform !== "Unknown"
      );
  }

  return [];
};

const normalizeRevenueTrendResponse = (response) => {
  const trendData = response?.trend || response?.data || [];

  return Array.isArray(trendData)
    ? trendData
        .map((item) => ({
          date: item?.date || "",
          amount: Number(item?.amount ?? item?.revenue ?? 0),
        }))
        .filter((item) => item.date && Number.isFinite(item.amount))
    : [];
};

const formatChartValue = (value) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const { user } = useAuth();
  const creatorId = user?.id;

  const [content, setContent] = useState([]);

  const [revenue, setRevenue] = useState(null);

  const [revenueTrend, setRevenueTrend] =
    useState([]);

  const [platformComparison, setPlatformComparison] =
    useState([]);

  const [platformPerformance, setPlatformPerformance] =
    useState([]);

  const [loadingContent, setLoadingContent] =
    useState(true);

  const [loadingAnalytics, setLoadingAnalytics] =
    useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     LOAD CONTENT
     
    This is the source for published content and trend dates.
  ========================================================= */

  useEffect(() => {
    let ignore = false;

    async function loadContent() {
      try {
        setLoadingContent(true);
        setError("");

        const response = await getAllContent(creatorId);

        if (ignore) {
          return;
        }

        const contentRows =
          normalizeContentResponse(response);

        setContent(contentRows);

      } catch (err) {
        if (!ignore) {
          console.error(
            "Content API error:",
            err
          );

          setError(
            "Unable to load content data. Please make sure the FastAPI server is running."
          );
        }
      } finally {
        if (!ignore) {
          setLoadingContent(false);
        }
      }
    }

    if (!creatorId) {
      setLoadingContent(false);
      return () => {
        ignore = true;
      };
    }

    loadContent();

    return () => {
      ignore = true;
    };
  }, [creatorId]);

  /* =========================================================
     BACKEND ANALYTICS
     
     All actual analytics come from FastAPI.
  ========================================================= */

  useEffect(() => {
    if (!creatorId) {
      return;
    }

    let ignore = false;

    async function loadDashboardAnalytics() {
      try {
        setLoadingAnalytics(true);
        setError("");

        const [
          revenueResponse,
          revenueTrendResponse,
          platformComparisonResponse,
          platformPerformanceResponse,
        ] = await Promise.all([
          getRevenueSummary(creatorId),
          getRevenueTrend(creatorId),
          getPlatformComparison(creatorId),
          getPlatformPerformance(creatorId),
        ]);

        if (ignore) {
          return;
        }

        /*
         * Revenue comes directly from backend.
         */
        setRevenue(revenueResponse);

        setRevenueTrend(
          normalizeRevenueTrendResponse(revenueTrendResponse)
        );

        /*
         * Platform comparison comes directly
         * from backend analytics.
         */
        setPlatformComparison(
          normalizePlatformResponse(
            platformComparisonResponse
          )
        );

        /*
         * Platform performance comes directly
         * from backend analytics.
         */
        setPlatformPerformance(
          normalizePlatformResponse(
            platformPerformanceResponse
          )
        );
      } catch (err) {
        if (!ignore) {
          console.error(
            "Dashboard analytics API error:",
            err
          );

          setError(
            "Unable to load dashboard analytics. Please make sure the FastAPI analytics endpoints are available."
          );
        }
      } finally {
        if (!ignore) {
          setLoadingAnalytics(false);
        }
      }
    }

    loadDashboardAnalytics();

    return () => {
      ignore = true;
    };
  }, [creatorId]);

  /* =========================================================
     BACKEND PLATFORM DATA
     
     The KPI values are now taken from backend analytics,
     not calculated from individual content rows.
  ========================================================= */

  const selectedBackendPerformance =
    useMemo(() => {
      const rows =
        platformPerformance.length > 0
          ? platformPerformance
          : platformComparison;

      if (rows.length === 0) {
        return null;
      }

      return rows.reduce(
        (totals, item) => ({
          platform: "All",

          views:
            totals.views +
            Number(item.views || 0),

          likes:
            totals.likes +
            Number(item.likes || 0),

          comments:
            totals.comments +
            Number(item.comments || 0),

          shares:
            totals.shares +
            Number(item.shares || 0),

          saves:
            totals.saves +
            Number(item.saves || 0),

          reach:
            totals.reach +
            Number(item.reach || 0),

          engagement: 0,
        }),
        {
          platform: "All",
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          reach: 0,
          engagement: 0,
        }
      );
    }, [
      platformPerformance,
      platformComparison,
    ]);

  /*
   * For All Platforms, calculate the aggregate engagement
   * percentage from the backend platform totals.
   *
   * For a specific platform, use the engagement value
   * returned by backend analytics whenever available.
   */
  const backendEngagement = useMemo(() => {
    if (!selectedBackendPerformance) {
      return 0;
    }

    const views =
      Number(
        selectedBackendPerformance.views
      ) || 0;

    const likes =
      Number(
        selectedBackendPerformance.likes
      ) || 0;

    const comments =
      Number(
        selectedBackendPerformance.comments
      ) || 0;

    const shares =
      Number(
        selectedBackendPerformance.shares
      ) || 0;

    const saves =
      Number(
        selectedBackendPerformance.saves
      ) || 0;

    if (views <= 0) {
      return 0;
    }

    /*
     * This is based exclusively on values
     * returned by the backend.
     */
    return (
      ((likes +
        comments +
        shares +
        saves) /
        views) *
      100
    );
  }, [
    selectedBackendPerformance,
  ]);

  const totalViews =
    Number(
      selectedBackendPerformance?.views || 0
    );

  const totalLikes =
    Number(
      selectedBackendPerformance?.likes || 0
    );

  const totalReach =
    Number(
      selectedBackendPerformance?.reach || 0
    );

  const totalEngagement =
    Number(backendEngagement).toFixed(2);

  /* =========================================================
     PERFORMANCE TREND
     
     This chart uses real backend content records.
     
     Your current backend does not expose a dedicated
     dashboard monthly performance endpoint, so the
     frontend groups the real /content/ records by month.
     
     No numbers are generated or hardcoded.
  ========================================================= */

  const performanceData = useMemo(() => {
    const monthlyMap = {};

    content.forEach((item) => {
      if (!item?.published_date) {
        return;
      }

      const date = new Date(
        item.published_date
      );

      if (
        Number.isNaN(date.getTime())
      ) {
        return;
      }

      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          views: 0,
          likes: 0,
        };
      }

      monthlyMap[monthKey].views += Number(
        item?.views || 0
      );

      monthlyMap[monthKey].likes += Number(
        item?.likes || 0
      );
    });

    return Object.values(monthlyMap)
      .sort((a, b) =>
        a.month.localeCompare(
          b.month
        )
      )
      .map((item) => ({
        ...item,
        label: new Date(
          `${item.month}-01`
        ).toLocaleDateString(
          "en-IN",
          {
            month: "short",
            year: "numeric",
          }
        ),
      }));
  }, [content]);

  /* =========================================================
     PLATFORM COMPARISON
     
     Already returned by backend.
  ========================================================= */

  const sortedPlatformComparison =
    useMemo(() => {
      return [
        ...platformComparison,
      ].sort(
        (a, b) =>
          Number(b.views || 0) -
          Number(a.views || 0)
      );
    }, [platformComparison]);

  /* =========================================================
     BEST PLATFORM
     
     Based on backend platform comparison.
  ========================================================= */

  const bestPlatform =
    sortedPlatformComparison[0];

  const loading =
    loadingContent ||
    loadingAnalytics;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =========================
            HERO
        ========================== */}

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

          </div>
        </div>

        {/* =========================
            ERROR
        ========================== */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* =========================
            KPI CARDS
        ========================== */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

          {/* Views */}

          <div className="stat-card stat-card-indigo">
            <div className="flex items-center justify-between">

              <p className="text-sm font-medium text-indigo-100">
                Total Views
              </p>

              <span className="stat-icon">
                👁️
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-bold text-white">
              {loading
                ? "..."
                : totalViews.toLocaleString()}
            </h2>

            <p className="mt-2 text-sm text-indigo-100/90">
              Across all connected platforms
            </p>
          </div>

          {/* Likes */}

          <div className="stat-card stat-card-emerald">
            <div className="flex items-center justify-between">

              <p className="text-sm font-medium text-emerald-50">
                Total Likes
              </p>

              <span className="stat-icon">
                👍
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-bold text-white">
              {loading
                ? "..."
                : totalLikes.toLocaleString()}
            </h2>

            <p className="mt-2 text-sm text-emerald-50/90">
              Total audience engagement
            </p>
          </div>

          {/* Engagement */}

          <div className="stat-card stat-card-sky">
            <div className="flex items-center justify-between">

              <p className="text-sm font-medium text-sky-50">
                Engagement
              </p>

              <span className="stat-icon">
                ⚡
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-bold text-white">
              {loading
                ? "..."
                : `${totalEngagement}%`}
            </h2>

            <p className="mt-2 text-sm text-sky-50/90">
              Average across platforms
            </p>
          </div>

          {/* Revenue */}

          <div className="stat-card stat-card-dark">
            <div className="flex items-center justify-between">

              <p className="text-sm font-medium text-violet-100">
                Total Revenue
              </p>

              <span className="stat-icon">
                💰
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-bold text-white">
              {loading
                ? "..."
                : `₹${Number(
                    revenue?.total_revenue ||
                      revenue?.totalRevenue ||
                      revenue?.amount ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}`}
            </h2>

            <p className="mt-2 text-sm text-violet-100/90">
              Earnings to date
            </p>
          </div>
        </div>

        {/* =========================
            CHARTS
        ========================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Performance Trends */}

          <div className="dashboard-panel">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Performance Trends
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Monthly views and likes from your content
                </p>
              </div>

              <span className="chart-badge chart-badge-live">
                Live
              </span>
            </div>

            <div className="h-80">

              {loading ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  Loading chart...
                </div>
              ) : performanceData.length ===
                0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  No content data available
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={performanceData}
                    margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
                  >
                    <defs>

                      <linearGradient
                        id="viewsArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#4f46e5"
                          stopOpacity={0.32}
                        />

                        <stop
                          offset="100%"
                          stopColor="#818cf8"
                          stopOpacity={0.03}
                        />
                      </linearGradient>

                      <linearGradient
                        id="likesArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#059669"
                          stopOpacity={0.3}
                        />

                        <stop
                          offset="100%"
                          stopColor="#34d399"
                          stopOpacity={0.03}
                        />
                      </linearGradient>

                    </defs>

                    <CartesianGrid strokeDasharray="4 6" stroke="#e2e8f0" vertical={false} />

                    <XAxis
                      dataKey="label"
                      tick={{
                        fontSize: 11,
                        fill: "#ffffff",
                      }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={18}
                    />

                    <YAxis
                      yAxisId="views"
                      tick={{
                        fontSize: 11,
                        fill: "#ffffff",
                      }}
                      tickFormatter={formatChartValue}
                      axisLine={false}
                      tickLine={false}
                      width={42}
                    />

                    <YAxis
                      yAxisId="likes"
                      orientation="right"
                      tick={{
                        fontSize: 11,
                        fill: "#ffffff",
                      }}
                      tickFormatter={formatChartValue}
                      axisLine={false}
                      tickLine={false}
                      width={38}
                    />

                    <Tooltip
                      formatter={(value, name) => [
                        Number(value).toLocaleString("en-IN"),
                        name,
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{
                        background:
                          "#fff",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius: 12,
                        color: "#0f172a",
                        boxShadow:
                          "0 20px 40px rgba(15, 23, 42, 0.08)",
                      }}
                    />

                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={30}
                      iconType="circle"
                      wrapperStyle={{ color: "#ffffff" }}
                    />

                    <Area
                      type="monotone"
                      yAxisId="views"
                      dataKey="views"
                      name="Views"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fill="url(#viewsArea)"
                      fillOpacity={1}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                    />

                    <Area
                      type="monotone"
                      yAxisId="likes"
                      dataKey="likes"
                      name="Likes"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fill="url(#likesArea)"
                      fillOpacity={1}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Revenue Trend */}

          <div className="dark-analytics-panel">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  Revenue Trend
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Overview of creator revenue report
                </p>
              </div>
            </div>

            <div className="h-[360px] pt-2">

              {loading ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  Loading chart...
                </div>
              ) : revenueTrend.length ===
                0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  No revenue data available
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart data={revenueTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148, 163, 184, 0.2)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#cbd5e1" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#cbd5e1" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `₹${Number(
                          value
                        ).toLocaleString(
                          "en-IN"
                        )}`,
                        "Revenue",
                      ]}
                      contentStyle={{
                        background:
                          "#fff",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius: 12,
                        color: "#0f172a",
                        boxShadow:
                          "0 20px 40px rgba(15, 23, 42, 0.08)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Revenue"
                      stroke="#a78bfa"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#8b5cf6" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* =========================
            PLATFORM COMPARISON
        ========================== */}

        <div className="dark-list-panel mt-6">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-extrabold text-white">
                Platform Comparison
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Compare creator performance across platforms
              </p>
            </div>

          </div>

          {loading ? (
            <p className="text-slate-400">
              Loading platform comparison...
            </p>
          ) : sortedPlatformComparison.length ===
            0 ? (
            <p className="text-slate-400">
              No platform comparison data available.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[760px] text-left">

                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">

                    <th className="px-4 py-3">
                      Platform
                    </th>

                    <th className="px-4 py-3">
                      Views
                    </th>

                    <th className="px-4 py-3">
                      Likes
                    </th>

                    <th className="px-4 py-3">
                      Comments
                    </th>

                    <th className="px-4 py-3">
                      Reach
                    </th>

                    <th className="px-4 py-3">
                      Engagement
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {sortedPlatformComparison.map(
                    (item, index) => {

                      return (
                        <tr
                          key={`${item.platform}-${index}`}
                          className="border-b border-white/5 transition hover:bg-white/5"
                        >

                          <td className="px-4 py-4">

                            <div className="flex items-center gap-3">

                              <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                  "bg-indigo-400"
                                }`}
                              />

                              <span className="font-semibold text-white">
                                {item.platform}
                              </span>

                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-200">
                            {Number(
                              item.views || 0
                            ).toLocaleString()}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-200">
                            {Number(
                              item.likes || 0
                            ).toLocaleString()}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-200">
                            {Number(
                              item.comments || 0
                            ).toLocaleString()}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-200">
                            {Number(
                              item.reach || 0
                            ).toLocaleString()}
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-emerald-300">
                            {Number(
                              item.engagement ||
                                0
                            ).toFixed(2)}
                            %
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =========================
            PERFORMANCE SNAPSHOT
        ========================== */}

        <div className="dashboard-panel">

          <div className="mb-5">

            <h2 className="text-lg font-semibold text-slate-800">
              Creator Performance Snapshot
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A quick overview of your creator performance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Content count */}

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg shadow-black/10">

              <p className="text-sm font-medium text-white/80">
                Published Content
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {loading
                  ? "..."
                  : content.length.toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-white/70">
                Across all connected platforms
              </p>
            </div>

            {/* Reach */}

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg shadow-black/10">

              <p className="text-sm font-medium text-white/80">
                Total Reach
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {loading
                  ? "..."
                  : totalReach.toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-white/70">
                Across all connected platforms
              </p>
            </div>

            {/* Best platform */}

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg shadow-black/10">

              <p className="text-sm font-medium text-white/80">
                Leading Platform
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {loading
                  ? "..."
                  : bestPlatform?.platform ||
                    "—"}
              </p>

              <p className="mt-1 text-xs text-white/70">
                Platform with the highest views
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;

