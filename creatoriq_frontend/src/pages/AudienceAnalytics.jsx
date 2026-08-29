import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import api from "../services/api";

function AudienceAnalytics() {
  const creatorId = 2;

  const [audienceData, setAudienceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAudienceTrends = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/analytics/audience-trends/${creatorId}`
        );

        setAudienceData(response.data);
      } catch (err) {
        console.error("Audience analytics error:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load audience analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAudienceTrends();
  }, []);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Audience Analytics
        </h1>

        <p className="mt-2 text-slate-400">
          Audience growth, reach and engagement trends for Creator{" "}
          {creatorId}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-slate-400">
            Loading audience analytics...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <h2 className="font-semibold text-red-400">
            Unable to load audience data
          </h2>

          <p className="mt-2 text-sm text-red-300">
            {error}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && audienceData.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10">
            <span className="text-2xl">👥</span>
          </div>

          <h2 className="text-xl font-semibold text-white">
            No audience data available
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            There are currently no audience trend records for
            Creator {creatorId}. Once the backend contains audience
            analytics data, it will appear here automatically.
          </p>
        </div>
      )}

      {/* Real Data */}
      {!loading && !error && audienceData.length > 0 && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Latest Followers
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                {audienceData[
                  audienceData.length - 1
                ].followers.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Latest Reach
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                {audienceData[
                  audienceData.length - 1
                ].reach.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Engagement Rate
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                {
                  audienceData[
                    audienceData.length - 1
                  ].engagement_rate
                }
                %
              </h2>
            </div>
          </div>

          {/* Followers Chart */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">
                Follower Growth
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Audience growth over time
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={audienceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                  />

                  <YAxis
                    stroke="#94a3b8"
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="followers"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reach + Engagement */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-6 text-xl font-semibold text-white">
                Audience Reach
              </h2>

              <div className="h-72">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart data={audienceData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                    />

                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                    />

                    <YAxis
                      stroke="#94a3b8"
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="reach"
                      stroke="#22d3ee"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-6 text-xl font-semibold text-white">
                Engagement Rate
              </h2>

              <div className="h-72">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart data={audienceData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                    />

                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                    />

                    <YAxis
                      stroke="#94a3b8"
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                      formatter={(value) => [
                        `${value}%`,
                        "Engagement Rate",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="engagement_rate"
                      stroke="#34d399"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-6">
              <h2 className="text-xl font-semibold text-white">
                Audience Trend Data
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-sm text-slate-400">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Followers</th>
                    <th className="px-6 py-4">Reach</th>
                    <th className="px-6 py-4">
                      Engagement
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {audienceData.map((item) => (
                    <tr
                      key={item.date}
                      className="border-b border-slate-800/70 text-sm"
                    >
                      <td className="px-6 py-4 text-slate-300">
                        {item.date}
                      </td>

                      <td className="px-6 py-4 text-white">
                        {item.followers.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-white">
                        {item.reach.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-purple-400">
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

export default AudienceAnalytics;