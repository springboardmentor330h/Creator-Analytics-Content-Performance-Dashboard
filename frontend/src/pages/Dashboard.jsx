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
          platformPerformanceResponse,
        ] = await Promise.all([
          // Platform-specific summary
          api.get(
            platform === "All"
              ? "/analytics/summary"
              : `/analytics/summary?platform=${platform}`
          ),

          // Growth is creator-level because the current
          // Growth model does not contain platform information.
          api.get("/analytics/chart/followers"),

          // Platform comparison always shows all platforms.
          api.get("/analytics/platform-performance"),
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
          "Platform performance:",
          platformPerformanceResponse.data
        );

        setSummary(summaryResponse.data);

        setGrowthData(growthResponse.data);

        setPlatformPerformance(
          platformPerformanceResponse.data
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
      <div className="mt-6 flex gap-3">
        {["All", "YouTube", "Instagram"].map(
          (item) => (
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
          )
        )}
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
           : Number(summary.total_reach).toLocaleString()
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
                          item.total_views || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {Number(
                          item.total_likes || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {Number(
                          item.total_comments || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.total_reach == null
                          ? "N/A"
                          : Number(item.total_reach).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {Number(
                          item.average_engagement_rate || 0
                        ).toFixed(2)}
                        %
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