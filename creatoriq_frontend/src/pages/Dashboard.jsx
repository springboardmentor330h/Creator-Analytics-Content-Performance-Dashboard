import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import {
  getAllContent,
  getRevenueSummary,
  getMonthlyRevenue,
} from "../services/api";

function Dashboard() {
  // Temporary creator selection.
  // Later we can connect this to login/profile.
  const creatorId = 2;

  const [content, setContent] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          contentResponse,
          revenueResponse,
          monthlyRevenueResponse,
        ] = await Promise.all([
          getAllContent(),
          getRevenueSummary(creatorId),
          getMonthlyRevenue(creatorId),
        ]);

        if (ignore) return;

        // Keep only this creator's content
        const creatorContent = contentResponse.filter(
          (item) => item.creator_id === creatorId
        );

        setContent(creatorContent);
        setRevenue(revenueResponse);

        const monthlyData =
          monthlyRevenueResponse.monthly_revenue || [];

        setMonthlyRevenue(
          monthlyData.map((item) => ({
            month: item.month,
            revenue: Number(item.amount),
          }))
        );
      } catch (err) {
        if (!ignore) {
          console.error("Dashboard API error:", err);
          setError(
            "Unable to load dashboard data. Please make sure the FastAPI server is running."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [creatorId]);

  // Calculate content KPIs from real backend content data
  const totalViews = content.reduce(
    (sum, item) => sum + Number(item.views || 0),
    0
  );

  const totalLikes = content.reduce(
    (sum, item) => sum + Number(item.likes || 0),
    0
  );

  const totalComments = content.reduce(
    (sum, item) => sum + Number(item.comments || 0),
    0
  );

  const totalEngagement =
    totalViews > 0
      ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(2)
      : "0.00";

  const topContent = [...content]
    .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
    .slice(0, 5);

  const performanceData = content
    .slice()
    .sort(
      (a, b) =>
        new Date(a.published_date) -
        new Date(b.published_date)
    )
    .slice(-10)
    .map((item) => ({
      title:
        item.content_title?.length > 18
          ? item.content_title.substring(0, 18) + "..."
          : item.content_title,
      views: Number(item.views || 0),
      likes: Number(item.likes || 0),
    }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-slate-500 mt-1">
          Overview of creator performance
        </p>

        <p className="text-sm text-slate-400 mt-2">
          Creator ID: {creatorId}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Views */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">
            Total Views
          </p>

          <h2 className="text-3xl font-bold mt-2 text-slate-800">
            {loading ? "..." : totalViews.toLocaleString()}
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            From content API
          </p>
        </div>

        {/* Likes */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">
            Total Likes
          </p>

          <h2 className="text-3xl font-bold mt-2 text-slate-800">
            {loading ? "..." : totalLikes.toLocaleString()}
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            From content API
          </p>
        </div>

        {/* Engagement */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">
            Engagement
          </p>

          <h2 className="text-3xl font-bold mt-2 text-slate-800">
            {loading ? "..." : `${totalEngagement}%`}
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            Likes + comments / views
          </p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">
            Total Revenue
          </p>

          <h2 className="text-3xl font-bold mt-2 text-slate-800">
            {loading
              ? "..."
              : `₹${Number(
                  revenue?.total_revenue || 0
                ).toLocaleString("en-IN")}`}
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            From revenue API
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        {/* Performance Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Performance Trends
          </h2>

          <p className="text-sm text-slate-400 mt-1 mb-5">
            Views and likes from creator content
          </p>

          <div className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                Loading chart...
              </div>
            ) : performanceData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                No content data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#4f46e5"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="likes"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Revenue Trends
          </h2>

          <p className="text-sm text-slate-400 mt-1 mb-5">
            Monthly revenue from the backend
          </p>

          <div className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                Loading chart...
              </div>
            ) : monthlyRevenue.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                No revenue data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />

                  <Bar
                    dataKey="revenue"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mt-6">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Top Performing Content
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Ranked by views
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-400">
            Loading content...
          </p>
        ) : topContent.length === 0 ? (
          <p className="text-slate-400">
            No content available for this creator.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="py-3 px-3">
                    Content
                  </th>

                  <th className="py-3 px-3">
                    Platform
                  </th>

                  <th className="py-3 px-3">
                    Views
                  </th>

                  <th className="py-3 px-3">
                    Likes
                  </th>

                  <th className="py-3 px-3">
                    Comments
                  </th>
                </tr>
              </thead>

              <tbody>
                {topContent.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-4 px-3 font-medium text-slate-700">
                      {item.content_title}
                    </td>

                    <td className="py-4 px-3 text-slate-500">
                      {item.platform}
                    </td>

                    <td className="py-4 px-3">
                      {Number(
                        item.views || 0
                      ).toLocaleString()}
                    </td>

                    <td className="py-4 px-3">
                      {Number(
                        item.likes || 0
                      ).toLocaleString()}
                    </td>

                    <td className="py-4 px-3">
                      {Number(
                        item.comments || 0
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

