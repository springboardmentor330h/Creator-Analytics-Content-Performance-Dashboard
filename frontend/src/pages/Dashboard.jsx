
import { useEffect, useState } from "react";
import api from "../api/axios";
import KpiCard from "../components/common/KpiCard";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [summary, setSummary] = useState(null);

  const [growthData, setGrowthData] = useState({
    labels: [],
    values: [],
  });

  const [platformPerformance, setPlatformPerformance] =
    useState([]);

  const [platform, setPlatform] = useState("All");

  // Date filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const [dateError, setDateError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // APPLY DATE FILTER
  // --------------------------------------------------

  const handleApplyDateFilter = () => {
    if (
      startDate &&
      endDate &&
      startDate > endDate
    ) {
      setDateError(
        "Start date cannot be after end date."
      );
      return;
    }

    setDateError("");

    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  // --------------------------------------------------
  // CLEAR DATE FILTER
  // --------------------------------------------------

  const handleClearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setDateError("");
  };

  // --------------------------------------------------
  // BUILD QUERY PARAMETERS
  // --------------------------------------------------

  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (platform !== "All") {
      params.append("platform", platform);
    }

    if (appliedStartDate) {
      params.append(
        "start_date",
        appliedStartDate
      );
    }

    if (appliedEndDate) {
      params.append(
        "end_date",
        appliedEndDate
      );
    }

    const queryString = params.toString();

    return queryString
      ? `?${queryString}`
      : "";
  };

  // --------------------------------------------------
  // FETCH DASHBOARD DATA
  // --------------------------------------------------

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const queryString =
          buildQueryString();

        const platformComparisonParams =
          new URLSearchParams();

        if (appliedStartDate) {
          platformComparisonParams.append(
            "start_date",
            appliedStartDate
          );
        }

        if (appliedEndDate) {
          platformComparisonParams.append(
            "end_date",
            appliedEndDate
          );
        }

        const platformComparisonQuery =
          platformComparisonParams.toString();

        const [
          summaryResponse,
          growthResponse,
          platformComparisonResponse,
        ] = await Promise.all([
          // Summary
          api.get(
            `/analytics/summary${queryString}`
          ),

          // Follower growth chart
          api.get(
            `/analytics/chart/followers${queryString}`
          ),

          // Platform comparison
          api.get(
            platformComparisonQuery
              ? `/analytics/platform-comparison?${platformComparisonQuery}`
              : "/analytics/platform-comparison"
          ),
        ]);

        console.log(
          "Dashboard summary:",
          summaryResponse.data
        );

        console.log(
          "Growth data:",
          growthResponse.data
        );

        console.log(
          "Platform comparison:",
          platformComparisonResponse.data
        );

        setSummary(
          summaryResponse.data
        );

        setGrowthData(
          growthResponse.data
        );

        setPlatformPerformance(
          platformComparisonResponse.data
        );
      } catch (err) {
        console.error(
          "Dashboard API Error:",
          err
        );

        setError(
          "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [
    platform,
    appliedStartDate,
    appliedEndDate,
  ]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-slate-600">
          Loading dashboard data...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-600">
          {error}
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // NO DATA
  // --------------------------------------------------

  if (!summary) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-slate-600">
          No dashboard data available.
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // FORMAT OPTIONAL / MISSING METRICS
  // --------------------------------------------------

  const formatMetric = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "N/A";
    }

    return Number(value).toLocaleString();
  };

  const formatPercentage = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "N/A";
    }

    return `${Number(value).toFixed(2)}%`;
  };

  // --------------------------------------------------
  // FOLLOWER CHART
  // --------------------------------------------------

  const followerChart = {
    labels: growthData.labels || [],

    datasets: [
      {
        label: "Followers",

        data: (
          growthData.values || []
        ).map(
          (value) =>
            value === null ||
            value === undefined
              ? null
              : Number(value)
        ),

        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const hasGrowthData =
    growthData.labels?.length > 0 &&
    growthData.values?.length > 0;

  // --------------------------------------------------
  // CURRENT FOLLOWERS
  // --------------------------------------------------
  // Use backend summary value.
  //
  // All:
  // Combined latest followers from all platforms.
  //
  // Selected platform:
  // Latest followers for that platform.
  // --------------------------------------------------

  const currentFollowers =
    summary.total_followers ?? null;

  // --------------------------------------------------
  // FOLLOWER GROWTH
  // --------------------------------------------------
  //
  // YouTube and Instagram:
  // Growth is unavailable -> N/A.
  //
  // TikTok, Facebook, LinkedIn and X:
  // Use actual growth returned by backend.
  //
  // All:
  // Combine available growth values from supported
  // platforms.
  // --------------------------------------------------

  const unavailableGrowthPlatforms = [
    "youtube",
    "instagram",
  ];

  const selectedPlatform =
    platform.toLowerCase();

  const selectedPlatformData =
    platformPerformance.find(
      (item) =>
        item.platform?.toLowerCase() ===
        selectedPlatform
    );

  let followerGrowth = null;

  // --------------------------------------------------
  // ALL PLATFORMS
  // --------------------------------------------------

  if (platform === "All") {
    const availableGrowth =
      platformPerformance
        .filter(
          (item) =>
            item.growth !== null &&
            item.growth !== undefined &&
            !unavailableGrowthPlatforms.includes(
              item.platform?.toLowerCase()
            )
        )
        .map(
          (item) => Number(item.growth)
        );

    followerGrowth =
      availableGrowth.length > 0
        ? availableGrowth.reduce(
            (total, value) =>
              total + value,
            0
          )
        : null;
  }

  // --------------------------------------------------
  // SELECTED PLATFORM
  // --------------------------------------------------

  else if (
    !unavailableGrowthPlatforms.includes(
      selectedPlatform
    )
  ) {
    followerGrowth =
      selectedPlatformData?.growth ??
      null;
  }

  // --------------------------------------------------
  // FILTER PLATFORM COMPARISON
  // --------------------------------------------------

  const filteredPlatformPerformance =
    platform === "All"
      ? platformPerformance
      : platformPerformance.filter(
          (item) =>
            item.platform?.toLowerCase() ===
            platform.toLowerCase()
        );

  return (
    <div>
      {/* Dashboard Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-slate-500">
          Overview of your creator performance
        </p>
      </div>

      {/* Platform Selector */}
      <div className="mt-6 flex flex-wrap gap-3">
        {[
          "All",
          "YouTube",
          "Instagram",
          "TikTok",
          "Facebook",
          "LinkedIn",
          "X",
        ].map((item) => (
          <button
            key={item}
            onClick={() =>
              setPlatform(item)
            }
            className={`rounded-lg px-4 py-2 font-medium transition ${
              platform === item
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* --------------------------------------------------
          DATE FILTER
      -------------------------------------------------- */}

      <div className="mt-6 rounded-xl bg-white p-4 shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

          {/* Start Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
            />
          </div>

          {/* Apply */}
          <button
            onClick={
              handleApplyDateFilter
            }
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-800"
          >
            Apply Filter
          </button>

          {/* Clear */}
          <button
            onClick={
              handleClearDateFilter
            }
            className="rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Clear
          </button>
        </div>

        {/* Date Error */}
        {dateError && (
          <p className="mt-3 text-sm text-red-600">
            {dateError}
          </p>
        )}

        {/* Active Filter */}
        {(appliedStartDate ||
          appliedEndDate) && (
          <p className="mt-3 text-sm text-slate-500">
            Showing data
            {appliedStartDate
              ? ` from ${appliedStartDate}`
              : ""}
            {appliedEndDate
              ? ` to ${appliedEndDate}`
              : ""}
          </p>
        )}
      </div>

      {/* --------------------------------------------------
          KPI CARDS
      -------------------------------------------------- */}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

        <KpiCard
          title="Total Views"
          value={
            summary.total_views == null
              ? "N/A"
              : Number(
                  summary.total_views
                ).toLocaleString()
          }
        />

        <KpiCard
          title="Total Likes"
          value={
            summary.total_likes == null
              ? "N/A"
              : Number(
                  summary.total_likes
                ).toLocaleString()
          }
        />

        <KpiCard
          title="Total Comments"
          value={
            summary.total_comments == null
              ? "N/A"
              : Number(
                  summary.total_comments
                ).toLocaleString()
          }
        />

        <KpiCard
          title="Total Reach"
          value={
            summary.total_reach == null
              ? "N/A"
              : Number(
                  summary.total_reach
                ).toLocaleString()
          }
        />

        <KpiCard
          title="Current Followers"
          value={
            currentFollowers == null
              ? "N/A"
              : Number(
                  currentFollowers
                ).toLocaleString()
          }
        />

        <KpiCard
          title="Follower Growth"
          value={
            followerGrowth == null
              ? "N/A"
              : followerGrowth > 0
              ? `+${Number(
                  followerGrowth
                ).toLocaleString()}`
              : Number(
                  followerGrowth
                ).toLocaleString()
          }
        />
      </div>

      {/* --------------------------------------------------
          FOLLOWER GROWTH CHART
      -------------------------------------------------- */}

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-semibold text-slate-800">
          Follower Growth
        </h2>

        {hasGrowthData ? (
          <div className="h-[350px]">
            <Line
              data={followerChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                  legend: {
                    display: true,
                  },
                },

                scales: {
                  y: {
                    beginAtZero: false,
                  },
                },
              }}
            />
          </div>
        ) : (
          <p className="text-slate-500">
            No follower growth data available.
          </p>
        )}
      </div>

      {/* --------------------------------------------------
          PLATFORM COMPARISON
      -------------------------------------------------- */}

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-semibold text-slate-800">
          Platform Comparison
        </h2>

        {filteredPlatformPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">

                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                    Platform
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                    Views
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                    Likes
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                    Comments
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                    Reach
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                    Engagement Rate
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                    Growth
                  </th>

                </tr>
              </thead>

              <tbody>
                {filteredPlatformPerformance.map(
                  (item) => {

                    const platformName =
                      item.platform?.toLowerCase();

                    // YouTube does not provide
                    // reach and growth data
                    // for this dashboard.
                    const isYouTube =
                      platformName ===
                      "youtube";

                    // Instagram growth is
                    // unavailable.
                    const isInstagram =
                      platformName ===
                      "instagram";

                    return (
                      <tr
                        key={item.platform}
                        className="border-b border-slate-100"
                      >

                        <td className="px-4 py-4 font-medium text-slate-800">
                          {item.platform}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {formatMetric(
                            item.views
                          )}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {formatMetric(
                            item.likes
                          )}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {formatMetric(
                            item.comments
                          )}
                        </td>

                        {/* Reach */}
                        <td className="px-4 py-4 text-slate-600">
                          {isYouTube
                            ? "N/A"
                            : formatMetric(
                                item.reach
                              )}
                        </td>

                        {/* Engagement Rate */}
                        <td className="px-4 py-4 text-slate-600">
                          {formatPercentage(
                            item.engagement_rate
                          )}
                        </td>

                        {/* Growth */}
                        <td className="px-4 py-4 font-medium text-slate-700">
                          {isYouTube ||
                          isInstagram
                            ? "N/A"
                            : item.growth ==
                                null
                            ? "N/A"
                            : Number(
                                item.growth
                              ) > 0
                            ? `+${Number(
                                item.growth
                              ).toLocaleString()}`
                            : Number(
                                item.growth
                              ).toLocaleString()}
                        </td>

                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500">
            No platform performance data available.
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

