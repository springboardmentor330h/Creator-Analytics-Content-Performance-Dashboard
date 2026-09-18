import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import AnalyticsChart from "../components/AnalyticsChart";

const PLATFORMS = [
  "All Platforms",
  "YouTube",
  "Instagram",
  "TikTok",
  "Facebook",
  "LinkedIn",
  "X",
];

function GrowthTrends() {
  const [platform, setPlatform] = useState("All Platforms");

  const [summary, setSummary] = useState(null);
  const [overallSummary, setOverallSummary] = useState(null);
  const [growthRecords, setGrowthRecords] = useState([]);
  const [allGrowthRecords, setAllGrowthRecords] = useState([]);
  const [platformPerformance, setPlatformPerformance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ============================================================
   * FETCH DATA
   * ============================================================
   */

  useEffect(() => {
    const fetchGrowthAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const selectedPlatform =
          platform === "All Platforms" ? undefined : platform;

        const requests = [
          // Selected platform summary
          api.get("/analytics/summary", {
            params: selectedPlatform
              ? { platform: selectedPlatform }
              : {},
          }),

          // Overall summary - always unfiltered
          api.get("/analytics/summary"),

          // Selected platform growth records
          api.get("/analytics/growth", {
            params: selectedPlatform
              ? { platform: selectedPlatform }
              : {},
          }),

          // ALL growth records.
          // Used for All Platforms calculations and
          // overall platform comparison.
          api.get("/analytics/growth"),

          // Platform performance comparison
          api.get("/analytics/platform-performance"),
        ];

        const [
          summaryResponse,
          overallSummaryResponse,
          growthResponse,
          allGrowthResponse,
          platformResponse,
        ] = await Promise.all(requests);

        const summaryData =
          summaryResponse.data?.data ??
          summaryResponse.data;

        const overallSummaryData =
          overallSummaryResponse.data?.data ??
          overallSummaryResponse.data;

        const growthData =
          growthResponse.data?.data ??
          growthResponse.data;

        const allGrowthData =
          allGrowthResponse.data?.data ??
          allGrowthResponse.data;

        const platformData =
          platformResponse.data?.data ??
          platformResponse.data;

        setSummary(summaryData);
        setOverallSummary(overallSummaryData);

        setGrowthRecords(
          Array.isArray(growthData)
            ? growthData
            : []
        );

        setAllGrowthRecords(
          Array.isArray(allGrowthData)
            ? allGrowthData
            : []
        );

        /*
         * Platform performance API currently returns an object
         * in the existing backend:
         *
         * {
         *   YouTube: {...},
         *   Instagram: {...}
         * }
         *
         * Convert it into an array for the table.
         */

        if (
          platformData &&
          typeof platformData === "object" &&
          !Array.isArray(platformData)
        ) {
          const formattedPlatformData =
            Object.entries(platformData).map(
              ([platformName, values]) => ({
                platform: platformName,
                ...values,
              })
            );

          setPlatformPerformance(
            formattedPlatformData
          );
        } else if (Array.isArray(platformData)) {
          setPlatformPerformance(platformData);
        } else {
          setPlatformPerformance([]);
        }
      } catch (err) {
        console.error(
          "Growth analytics error:",
          err
        );

        if (err.response) {
          setError(
            `Unable to load growth analytics. Server returned ${err.response.status}.`
          );
        } else if (err.request) {
          setError(
            "Unable to connect to the backend. Make sure FastAPI is running."
          );
        } else {
          setError(
            "Unable to load growth analytics."
          );
        }

        setSummary(null);
        setOverallSummary(null);
        setGrowthRecords([]);
        setAllGrowthRecords([]);
        setPlatformPerformance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthAnalytics();
  }, [platform]);

  /*
   * ============================================================
   * SORT SELECTED PLATFORM RECORDS
   * ============================================================
   */

  const sortedGrowthRecords = useMemo(() => {
    return [...growthRecords].sort((a, b) => {
      const dateA = new Date(
        a.date || "1900-01-01"
      );

      const dateB = new Date(
        b.date || "1900-01-01"
      );

      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }

      return Number(a.id ?? 0) - Number(b.id ?? 0);
    });
  }, [growthRecords]);

  /*
   * ============================================================
   * SORT ALL PLATFORM RECORDS
   * ============================================================
   */

  const sortedAllGrowthRecords = useMemo(() => {
    return [...allGrowthRecords].sort((a, b) => {
      const dateA = new Date(
        a.date || "1900-01-01"
      );

      const dateB = new Date(
        b.date || "1900-01-01"
      );

      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }

      return Number(a.id ?? 0) - Number(b.id ?? 0);
    });
  }, [allGrowthRecords]);

  /*
   * ============================================================
   * CURRENT / FIRST RECORD FOR SELECTED PLATFORM
   * ============================================================
   */

  const firstSelectedRecord =
    sortedGrowthRecords.length > 0
      ? sortedGrowthRecords[0]
      : null;

  const latestSelectedRecord =
    sortedGrowthRecords.length > 0
      ? sortedGrowthRecords[
          sortedGrowthRecords.length - 1
        ]
      : null;

  /*
   * ============================================================
   * SELECTED PLATFORM FOLLOWERS
   *
   * IMPORTANT:
   * We DO NOT use summary.total_followers here.
   *
   * The latest Growth record is the source of truth.
   * This prevents every platform from displaying
   * the same follower count.
   * ============================================================
   */

  const selectedFirstFollowers = Number(
    firstSelectedRecord?.followers ?? 0
  );

  const selectedLatestFollowers = Number(
    latestSelectedRecord?.followers ?? 0
  );

  const selectedFollowerIncrease =
    selectedLatestFollowers -
    selectedFirstFollowers;

  const selectedFollowerGrowthPercentage =
    selectedFirstFollowers > 0
      ? (
          (selectedFollowerIncrease /
            selectedFirstFollowers) *
          100
        ).toFixed(2)
      : "0.00";

  /*
   * ============================================================
   * ALL PLATFORMS FOLLOWER CALCULATION
   *
   * For All Platforms:
   *
   * Current Followers =
   * latest follower count of each platform summed together.
   *
   * Follower Growth =
   * latest total - first total.
   * ============================================================
   */

  const allPlatformFollowerStats = useMemo(() => {
    if (sortedAllGrowthRecords.length === 0) {
      return {
        currentFollowers: 0,
        firstFollowers: 0,
        followerIncrease: 0,
        growthPercentage: "0.00",
      };
    }

    /*
     * Group records by platform.
     *
     * Records without a platform are kept separately
     * as legacy records.
     */

    const platformGroups = {};

    sortedAllGrowthRecords.forEach((record) => {
      const platformName =
        record.platform || "Unknown";

      if (!platformGroups[platformName]) {
        platformGroups[platformName] = [];
      }

      platformGroups[platformName].push(record);
    });

    let firstTotal = 0;
    let latestTotal = 0;

    Object.values(platformGroups).forEach(
      (records) => {
        const sortedRecords = [...records].sort(
          (a, b) => {
            const dateA = new Date(
              a.date || "1900-01-01"
            );

            const dateB = new Date(
              b.date || "1900-01-01"
            );

            if (
              dateA.getTime() !==
              dateB.getTime()
            ) {
              return dateA - dateB;
            }

            return (
              Number(a.id ?? 0) -
              Number(b.id ?? 0)
            );
          }
        );

        const first = sortedRecords[0];
        const latest =
          sortedRecords[
            sortedRecords.length - 1
          ];

        firstTotal += Number(
          first?.followers ?? 0
        );

        latestTotal += Number(
          latest?.followers ?? 0
        );
      }
    );

    const increase =
      latestTotal - firstTotal;

    const percentage =
      firstTotal > 0
        ? (
            (increase / firstTotal) *
            100
          ).toFixed(2)
        : "0.00";

    return {
      currentFollowers: latestTotal,
      firstFollowers: firstTotal,
      followerIncrease: increase,
      growthPercentage: percentage,
    };
  }, [sortedAllGrowthRecords]);

  /*
   * ============================================================
   * FINAL KPI VALUES
   * ============================================================
   */

  const currentFollowers =
    platform === "All Platforms"
      ? allPlatformFollowerStats.currentFollowers
      : selectedLatestFollowers;

  const followerIncrease =
    platform === "All Platforms"
      ? allPlatformFollowerStats.followerIncrease
      : selectedFollowerIncrease;

  const followerGrowthPercentage =
    platform === "All Platforms"
      ? allPlatformFollowerStats.growthPercentage
      : selectedFollowerGrowthPercentage;

  /*
   * ============================================================
   * CHART DATA
   * ============================================================
   */

  const followerData = useMemo(() => {
    return sortedGrowthRecords
      .filter((record) => record.date)
      .map((record) => ({
        label: record.date,
        value: Number(
          record.followers ?? 0
        ),
      }));
  }, [sortedGrowthRecords]);

  const reachData = useMemo(() => {
    return sortedGrowthRecords
      .filter((record) => record.date)
      .map((record) => ({
        label: record.date,
        value: Number(
          record.reach ?? 0
        ),
      }));
  }, [sortedGrowthRecords]);

  const engagementData = useMemo(() => {
    return sortedGrowthRecords
      .filter((record) => record.date)
      .map((record) => ({
        label: record.date,
        value: Number(
          record.engagement_rate ?? 0
        ),
      }));
  }, [sortedGrowthRecords]);

  /*
   * ============================================================
   * SELECTED PLATFORM CHART STATS
   * ============================================================
   */

  const highestFollowerValue =
    followerData.length > 0
      ? Math.max(
          ...followerData.map(
            (item) => item.value
          )
        )
      : 0;

  const highestEngagement =
    engagementData.length > 0
      ? Math.max(
          ...engagementData.map(
            (item) => item.value
          )
        )
      : 0;

  const lowestEngagement =
    engagementData.length > 0
      ? Math.min(
          ...engagementData.map(
            (item) => item.value
          )
        )
      : 0;

  /*
   * ============================================================
   * ENGAGEMENT KPI
   * ============================================================
   *
   * Calculate directly from selected growth records.
   * This keeps the KPI platform-specific.
   * ============================================================
   */

  const averageEngagement = useMemo(() => {
    if (engagementData.length === 0) {
      return 0;
    }

    const total = engagementData.reduce(
      (sum, item) => sum + item.value,
      0
    );

    return total / engagementData.length;
  }, [engagementData]);

  /*
   * ============================================================
   * BEST PLATFORM
   * ============================================================
   *
   * IMPORTANT:
   * This is ALWAYS taken from the overall,
   * unfiltered summary.
   *
   * Therefore:
   *
   * Select Instagram -> Best Platform still remains
   * the overall best platform.
   *
   * Select TikTok -> Best Platform still remains
   * the overall best platform.
   * ============================================================
   */

  const bestPlatform =
    overallSummary?.best_platform ||
    overallSummary?.bestPlatform ||
    "N/A";

  const selectedPlatformLabel = platform;

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-purple-500" />

          <p className="text-sm text-gray-500">
            Loading growth analytics...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR STATE
   * ============================================================
   */

  if (error) {
    return (
      <div className="w-full">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
          <h2 className="text-lg font-semibold text-red-400">
            Unable to load Growth & Trends
          </h2>

          <p className="mt-2 text-sm text-red-300">
            {error}
          </p>

          <p className="mt-4 text-xs text-gray-500">
            Check that the FastAPI backend is
            running and that the analytics
            endpoints are available in Swagger.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="w-full space-y-7">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
            Growth & Trends
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Track follower growth, reach,
            engagement trends, and platform
            performance.
          </p>
        </div>

        {/* PLATFORM SELECTOR */}

        <div className="w-full lg:w-64">
          <label
            htmlFor="growth-platform"
            className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
          >
            Platform
          </label>

          <select
            id="growth-platform"
            value={platform}
            onChange={(event) =>
              setPlatform(event.target.value)
            }
            className="w-full rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50"
          >
            {PLATFORMS.map((item) => (
              <option
                key={item}
                value={item}
                className="bg-[#151515] text-white"
              >
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ======================================================
          CURRENTLY VIEWING
      ====================================================== */}

      <section className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-5 py-4">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          Currently Viewing
        </p>

        <p className="mt-1 text-lg font-semibold text-purple-400">
          {selectedPlatformLabel}
        </p>
      </section>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* CURRENT FOLLOWERS */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <p className="text-sm text-gray-500">
            Current Followers
          </p>

          <p className="mt-3 text-3xl font-semibold text-white">
            {currentFollowers.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-gray-600">
            Latest recorded follower count
          </p>
        </div>

        {/* FOLLOWER GROWTH */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <p className="text-sm text-gray-500">
            Follower Growth
          </p>

          <p className="mt-3 text-3xl font-semibold text-white">
            {followerIncrease.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            {followerGrowthPercentage}% change
          </p>
        </div>

        {/* AVERAGE ENGAGEMENT */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <p className="text-sm text-gray-500">
            Avg. Engagement
          </p>

          <p className="mt-3 text-3xl font-semibold text-white">
            {averageEngagement.toFixed(2)}%
          </p>

          <p className="mt-2 text-xs text-gray-600">
            Average recorded engagement rate
          </p>
        </div>

        {/* BEST PLATFORM */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <p className="text-sm text-gray-500">
            Best Platform
          </p>

          <p className="mt-3 text-2xl font-semibold text-white">
            {bestPlatform}
          </p>

          <p className="mt-2 text-xs text-gray-600">
            Based on overall platform performance
          </p>
        </div>

      </section>

      {/* ======================================================
          FOLLOWER GROWTH CHART
      ====================================================== */}

      <section>
        {followerData.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#151515] p-8 text-center">
            <p className="text-sm text-gray-500">
              No follower growth data available
              for {selectedPlatformLabel}.
            </p>
          </div>
        ) : (
          <AnalyticsChart
            title="Follower Growth"
            description={`Track follower growth over time for ${selectedPlatformLabel}.`}
            data={followerData}
            dataKey="value"
            xAxisKey="label"
            yAxisLabel="Followers"
            lineColor="#a855f7"
          />
        )}
      </section>

      {/* ======================================================
          REACH TREND
      ====================================================== */}

      <section>
        {reachData.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#151515] p-8 text-center">
            <p className="text-sm text-gray-500">
              No reach data available for{" "}
              {selectedPlatformLabel}.
            </p>
          </div>
        ) : (
          <AnalyticsChart
            title="Reach Trend"
            description={`Track reach changes over time for ${selectedPlatformLabel}.`}
            data={reachData}
            dataKey="value"
            xAxisKey="label"
            yAxisLabel="Reach"
            lineColor="#22c55e"
          />
        )}
      </section>

      {/* ======================================================
          ENGAGEMENT TREND
      ====================================================== */}

      <section>
        {engagementData.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#151515] p-8 text-center">
            <p className="text-sm text-gray-500">
              No engagement trend data available
              for {selectedPlatformLabel}.
            </p>
          </div>
        ) : (
          <AnalyticsChart
            title="Engagement Trend"
            description={`Track engagement rate over time for ${selectedPlatformLabel}.`}
            data={engagementData}
            dataKey="value"
            xAxisKey="label"
            yAxisLabel="Engagement Rate"
            lineColor="#3b82f6"
            valueSuffix="%"
          />
        )}
      </section>

      {/* ======================================================
          TREND SUMMARY
      ====================================================== */}

      <section className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">

        {/* PEAK FOLLOWERS */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <p className="text-sm text-gray-500">
            Peak Followers
          </p>

          <p className="mt-3 text-2xl font-semibold text-white">
            {highestFollowerValue.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-gray-600">
            Highest recorded follower count
          </p>
        </div>

        {/* PEAK ENGAGEMENT */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <p className="text-sm text-gray-500">
            Peak Engagement
          </p>

          <p className="mt-3 text-2xl font-semibold text-white">
            {highestEngagement.toFixed(2)}%
          </p>

          <p className="mt-2 text-xs text-gray-600">
            Highest recorded engagement rate
          </p>
        </div>

        {/* LOWEST ENGAGEMENT */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <p className="text-sm text-gray-500">
            Lowest Engagement
          </p>

          <p className="mt-3 text-2xl font-semibold text-white">
            {lowestEngagement.toFixed(2)}%
          </p>

          <p className="mt-2 text-xs text-gray-600">
            Lowest recorded engagement rate
          </p>
        </div>

      </section>

      {/* ======================================================
          PLATFORM PERFORMANCE
      ====================================================== */}

      <section className="rounded-xl border border-white/10 bg-[#151515] p-6">

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Platform Performance
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Compare views, engagement, reach, and
            interactions across platforms.
          </p>
        </div>

        {platformPerformance.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-gray-500">
              No platform performance data
              available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">

              <thead>
                <tr className="border-b border-white/10">

                  <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Platform
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Views
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Likes
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Comments
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Reach
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Engagement
                  </th>

                </tr>
              </thead>

              <tbody>
                {platformPerformance.map(
                  (item, index) => (
                    <tr
                      key={`${item.platform}-${index}`}
                      className="border-b border-white/5 last:border-0"
                    >

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">

                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-xs font-medium text-purple-400">
                            {index + 1}
                          </span>

                          <span className="text-sm font-medium text-white">
                            {item.platform}
                          </span>

                        </div>
                      </td>

                      <td className="px-4 py-5 text-right text-sm text-gray-300">
                        {Number(
                          item.total_views ??
                            item.views ??
                            0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-5 text-right text-sm text-gray-300">
                        {Number(
                          item.total_likes ??
                            item.likes ??
                            0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-5 text-right text-sm text-gray-300">
                        {Number(
                          item.total_comments ??
                            item.comments ??
                            0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-5 text-right text-sm text-gray-300">
                        {Number(
                          item.total_reach ??
                            item.reach ??
                            0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-5 text-right">
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400">
                          {Number(
                            item.average_engagement_rate ??
                              item.engagement_rate ??
                              0
                          ).toFixed(2)}
                          %
                        </span>
                      </td>

                    </tr>
                  )
                )}
              </tbody>

            </table>
          </div>
        )}

      </section>

      {/* ======================================================
          HISTORICAL GROWTH DATA
      ====================================================== */}

      <section className="rounded-xl border border-white/10 bg-[#151515] p-6">

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Historical Growth Data
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Records retrieved directly from the
            growth analytics API.
          </p>
        </div>

        {sortedGrowthRecords.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-500">
              No historical growth records
              available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">

              <thead>
                <tr className="border-b border-white/10">

                  <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Platform
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Followers
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Reach
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Engagement
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Growth
                  </th>

                </tr>
              </thead>

              <tbody>
                {sortedGrowthRecords.map(
                  (record, index) => (
                    <tr
                      key={
                        record.id ??
                        `${record.date}-${index}`
                      }
                      className="border-b border-white/5 last:border-0"
                    >

                      <td className="px-4 py-4 text-sm text-gray-300">
                        {record.date ?? "N/A"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-300">
                        {record.platform ?? "N/A"}
                      </td>

                      <td className="px-4 py-4 text-right text-sm text-gray-300">
                        {Number(
                          record.followers ?? 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-right text-sm text-gray-300">
                        {Number(
                          record.reach ?? 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400">
                          {Number(
                            record.engagement_rate ??
                              0
                          ).toFixed(2)}
                          %
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-medium text-green-400">
                          {Number(
                            record.growth_percentage ??
                              0
                          ).toFixed(2)}
                          %
                        </span>
                      </td>

                    </tr>
                  )
                )}
              </tbody>

            </table>
          </div>
        )}

      </section>

    </div>
  );
}

export default GrowthTrends;