import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import api from "../services/api";

function GrowthTrends() {
  const { creatorId } = useParams();

  const [growthData, setGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeCreatorId = creatorId || "1";

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/analytics/growth/${activeCreatorId}`
        );

        setGrowthData(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        console.error("Growth API error:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load growth analytics."
        );

        setGrowthData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, [activeCreatorId]);

  const summary = useMemo(() => {
    if (!growthData.length) {
      return {
        followers: 0,
        dailyGrowth: 0,
        growthPercentage: 0,
        reach: 0,
        engagementRate: 0,
      };
    }

    const latest = growthData[growthData.length - 1];

    return {
      followers: latest.followers ?? 0,
      dailyGrowth: latest.daily_growth ?? 0,
      growthPercentage: latest.growth_percentage ?? 0,
      reach: latest.reach ?? 0,
      engagementRate: latest.engagement_rate ?? 0,
    };
  }, [growthData]);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Growth & Trends
        </h1>

        <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">
          <p className="text-slate-500">
            Loading growth analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Growth & Trends
        </h1>

        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Growth & Trends
        </h1>

        <p className="mt-2 text-slate-500">
          Growth analytics for Creator {activeCreatorId}
        </p>
      </div>

      {/* Empty State */}
      {growthData.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            No growth data available
          </h2>

          <p className="mt-2 text-slate-500">
            There is currently no growth analytics data
            available for Creator {activeCreatorId}.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Followers
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {summary.followers.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Daily Growth
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                +{summary.dailyGrowth.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Growth %
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {summary.growthPercentage}%
              </h2>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Reach
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {summary.reach.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Engagement Rate
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {summary.engagementRate}%
              </h2>
            </div>

          </div>

          {/* Followers Growth Chart */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Follower Growth
              </h2>

              <p className="text-sm text-slate-500">
                Follower count over time
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="followers"
                    name="Followers"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reach & Engagement */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-slate-900">
                Reach Trend
              </h2>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="date" />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="reach"
                      name="Reach"
                      stroke="#16a34a"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-slate-900">
                Engagement Rate
              </h2>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="date" />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="engagement_rate"
                      name="Engagement Rate"
                      stroke="#9333ea"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Growth Table */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">

            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Growth Analytics Data
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Date
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Followers
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Daily Growth
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Growth %
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Reach
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Engagement
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {growthData.map((item, index) => (
                    <tr
                      key={`${item.date}-${index}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {item.date}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {item.followers?.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        +{item.daily_growth?.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {item.growth_percentage}%
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {item.reach?.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {item.engagement_rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GrowthTrends;