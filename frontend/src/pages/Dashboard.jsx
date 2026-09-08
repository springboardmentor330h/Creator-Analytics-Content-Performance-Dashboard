
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          summaryResponse,
          growthResponse,
          platformComparisonResponse,
        ] = await Promise.all([
          // Platform-specific summary
          api.get(
            platform === "All"
              ? "/analytics/summary"
              : `/analytics/summary?platform=${platform}`
          ),

          
          // Platform-specific follower growth
        api.get(
          platform === "All"
          ? "/analytics/chart/followers"
          : `/analytics/chart/followers?platform=${platform}`
        ),

          // Platform comparison including Growth
          api.get("/analytics/platform-comparison"),
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

        setSummary(summaryResponse.data);

        setGrowthData(growthResponse.data);

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
  }, [platform]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-slate-600">
          Loading dashboard data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-slate-600">
          No dashboard data available.
        </p>
      </div>
    );
  }

  const followerChart = {
    labels: growthData.labels || [],

    datasets: [
      {
        label: "Followers",

        data: (growthData.values || []).map(
          (value) => Number(value || 0)
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
  // CALCULATE FOLLOWER GROWTH
  // --------------------------------------------------

  const followerValues = (growthData.values || []).map(
    (value) => Number(value || 0)
  );

  const firstFollowers =
    followerValues.length > 0
      ? followerValues[0]
      : 0;

  const currentFollowers =
    followerValues.length > 0
      ? followerValues[followerValues.length - 1]
      : Number(summary.total_followers || 0);

  const followerGrowth =
    followerValues.length > 1
      ? currentFollowers - firstFollowers
      : 0;

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
            onClick={() => setPlatform(item)}
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

      {/* KPI Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Total Views"
          value={Number(
            summary.total_views || 0
          ).toLocaleString()}
        />

        <KpiCard
          title="Total Likes"
          value={Number(
            summary.total_likes || 0
          ).toLocaleString()}
        />

        <KpiCard
          title="Total Comments"
          value={Number(
            summary.total_comments || 0
          ).toLocaleString()}
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
          value={Number(
            currentFollowers
          ).toLocaleString()}
        />

        <KpiCard
          title="Follower Growth"
          value={
            followerGrowth > 0
              ? `+${Number(
                  followerGrowth
                ).toLocaleString()}`
              : Number(
                  followerGrowth
                ).toLocaleString()
          }
        />
      </div>

      {/* Follower Growth Chart */}
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

      {/* Platform Comparison */}
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
                  (item) => (
                    <tr
                      key={item.platform}
                      className="border-b border-slate-100"
                    >
                      <td className="px-4 py-4 font-medium text-slate-800">
                        {item.platform}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {Number(
                          item.views || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {Number(
                          item.likes || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {Number(
                          item.comments || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {Number(
                          item.reach || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {Number(
                          item.engagement_rate || 0
                        ).toFixed(2)}
                        %
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-700">
                        {Number(
                          item.growth || 0
                        ) > 0
                          ? `+${Number(
                              item.growth
                            ).toLocaleString()}`
                          : Number(
                              item.growth || 0
                            ).toLocaleString()}
                      </td>
                    </tr>
                  )
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

