import { useEffect, useState } from "react";
import api from "../services/api";

import KPICard from "../components/KPICard";
import Loading from "../components/Loading";
import AnalyticsChart from "../components/AnalyticsChart";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [engagementData, setEngagementData] = useState([]);
  const [followerData, setFollowerData] = useState([]);

  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const platforms = [
    "All Platforms",
    "YouTube",
    "Instagram",
    "TikTok",
    "Facebook",
    "LinkedIn",
    "X",
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const platformParams =
          selectedPlatform === "All Platforms"
            ? {}
            : { platform: selectedPlatform };

        const [
          summaryResponse,
          engagementResponse,
          followerResponse,
        ] = await Promise.all([
          api.get("/analytics/summary", {
            params: platformParams,
          }),

          api.get("/analytics/chart/engagement", {
            params: platformParams,
          }),

          // Follower data is currently creator-level,
          // not platform-specific.
          api.get("/analytics/chart/followers", {
            params: platformParams,
          }),
        ]);

        /* -----------------------------
           Summary
        ----------------------------- */

        const summaryData = summaryResponse.data.data;

        setSummary(summaryData || null);

        /* -----------------------------
           Engagement Chart
        ----------------------------- */

        const engagement = engagementResponse.data.data;

        if (
          engagement &&
          Array.isArray(engagement.labels) &&
          Array.isArray(engagement.values)
        ) {
          setEngagementData(
            engagement.labels.map((label, index) => ({
              label,
              value: engagement.values[index] ?? 0,
            }))
          );
        } else {
          setEngagementData([]);
        }

        /* -----------------------------
           Follower Chart
        ----------------------------- */

        const followers = followerResponse.data.data;

        if (
          followers &&
          Array.isArray(followers.labels) &&
          Array.isArray(followers.values)
        ) {
          setFollowerData(
            followers.labels.map((label, index) => ({
              label,
              value: followers.values[index] ?? 0,
            }))
          );
        } else {
          setFollowerData([]);
        }
      } catch (err) {
        console.error("Dashboard API error:", err);

        setSummary(null);
        setEngagementData([]);
        setFollowerData([]);

        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedPlatform]);

  /* -----------------------------
     Loading
  ----------------------------- */

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  /* -----------------------------
     Error
  ----------------------------- */

  if (error) {
    return (
      <div className="w-full space-y-6">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
            Welcome back, Creator
          </h1>

          <p className="mt-1.5 text-sm text-gray-500">
            Here's what's happening with your content.
          </p>
        </section>

        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  /* -----------------------------
     Empty
  ----------------------------- */

  if (!summary) {
    return (
      <div className="w-full space-y-7">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
            Welcome back, Creator
          </h1>

          <p className="mt-1.5 text-sm text-gray-500">
            Here's what's happening with your content.
          </p>
        </section>

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6 text-gray-400">
          No dashboard data available for{" "}
          <span className="font-medium text-white">
            {selectedPlatform}
          </span>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-7">

      {/* =================================
          Welcome
      ================================= */}

      <section>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
              Welcome back, Creator
            </h1>

            <p className="mt-1.5 text-sm text-gray-500">
              Here's what's happening with your content.
            </p>
          </div>

          {/* Platform Selector */}
          <div className="w-full sm:w-auto">
            <label
              htmlFor="dashboard-platform"
              className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Platform
            </label>

            <select
              id="dashboard-platform"
              value={selectedPlatform}
              onChange={(event) =>
                setSelectedPlatform(event.target.value)
              }
              className="w-full rounded-lg border border-white/10 bg-[#151515] px-4 py-2.5 text-sm font-medium text-white outline-none transition hover:border-white/20 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 sm:w-52"
            >
              {platforms.map((platform) => (
                <option
                  key={platform}
                  value={platform}
                  className="bg-[#151515] text-white"
                >
                  {platform}
                </option>
              ))}
            </select>
          </div>

        </div>
      </section>


      {/* =================================
          Selected Platform Indicator
      ================================= */}

      <div className="flex items-center gap-2 rounded-lg border border-purple-500/10 bg-purple-500/5 px-4 py-3">
        <span className="text-xs uppercase tracking-wider text-gray-500">
          Viewing
        </span>

        <span className="text-sm font-semibold text-purple-400">
          {selectedPlatform}
        </span>

        {selectedPlatform !== "All Platforms" && (
          <span className="text-xs text-gray-500">
            platform analytics
          </span>
        )}
      </div>


      {/* =================================
          KPI Cards
      ================================= */}

      <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <KPICard
          title="Total Content"
          value={summary.total_content ?? 0}
          icon="▣"
        />

        <KPICard
          title="Total Views"
          value={(summary.total_views ?? 0).toLocaleString()}
          icon="◉"
        />

        <KPICard
          title="Total Reach"
          value={(summary.total_reach ?? 0).toLocaleString()}
          icon="◎"
        />

        <KPICard
          title="Engagement Rate"
          value={`${summary.average_engagement_rate ?? 0}%`}
          icon="↗"
        />

      </section>


      {/* =================================
          Charts
      ================================= */}

      <section className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2">

        <AnalyticsChart
          title="Engagement Trend"
          data={engagementData}
          dataKey="value"
          yAxisLabel="Engagement %"
        />

        <AnalyticsChart
          title={
            selectedPlatform === "All Platforms"
              ? "Follower Growth"
              : `${selectedPlatform} Follower Growth`
          }
          data={followerData}
          dataKey="value"
          yAxisLabel="Followers"
        />

      </section>


      {/* =================================
          Performance Cards
      ================================= */}

      <section className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2">

        {/* Performance Overview */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Performance Overview
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {selectedPlatform === "All Platforms"
                  ? "Overall engagement metrics"
                  : `${selectedPlatform} engagement metrics`}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">

            {/* Likes */}

            <div className="flex items-center justify-between border-b border-white/5 pb-4">

              <span className="text-sm text-gray-500">
                Likes
              </span>

              <span className="font-semibold text-white">
                {(summary.total_likes ?? 0).toLocaleString()}
              </span>

            </div>


            {/* Comments */}

            <div className="flex items-center justify-between border-b border-white/5 pb-4">

              <span className="text-sm text-gray-500">
                Comments
              </span>

              <span className="font-semibold text-white">
                {(summary.total_comments ?? 0).toLocaleString()}
              </span>

            </div>


            {/* Shares */}

            <div className="flex items-center justify-between">

              <span className="text-sm text-gray-500">
                Shares
              </span>

              <span className="font-semibold text-white">
                {(summary.total_shares ?? 0).toLocaleString()}
              </span>

            </div>

          </div>

        </div>


        {/* Top Performance */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">

          <div>
            <h2 className="text-lg font-semibold text-white">
              Top Performance
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {selectedPlatform === "All Platforms"
                ? "Your strongest performing content"
                : `Strongest ${selectedPlatform} performance`}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">

            {/* Best Platform */}

            <div className="rounded-lg bg-purple-500/5 p-4">

              <p className="text-xs uppercase tracking-wider text-gray-500">
                Best Platform
              </p>

              <p className="mt-2 text-xl font-semibold text-purple-400">
                {summary.best_platform || "No data"}
              </p>

            </div>


            {/* Top Content */}

            <div className="rounded-lg bg-white/[0.03] p-4">

              <p className="text-xs uppercase tracking-wider text-gray-500">
                Top Content
              </p>

              <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-white">
                {summary.top_content || "No data"}
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;