import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function PlatformComparison() {
  const [data, setData] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/analytics/platform-comparison")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load platform comparison"));
  }, []);

  const chartData = Object.entries(data).map(([platform, stats]) => ({
    platform,
    views: stats.views,
    reach: stats.reach,
    engagement_rate: stats.engagement_rate,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Platform Comparison</h1>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          {chartData.length > 0 ? (
            <div className="mb-6 rounded-xl bg-white p-4 shadow">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#4F46E5" />
                  <Bar dataKey="reach" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No content data yet.</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data).map(([platform, stats]) => (
              <div key={platform} className="rounded-xl bg-white p-4 shadow">
                <p className="mb-2 font-medium">{platform}</p>
                <p className="text-sm">Views: {stats.views.toLocaleString()}</p>
                <p className="text-sm">Reach: {stats.reach.toLocaleString()}</p>
                <p className="text-sm">Likes: {stats.likes.toLocaleString()}</p>
                <p className="text-sm">Comments: {stats.comments.toLocaleString()}</p>
                <p className="text-sm font-semibold">Engagement: {stats.engagement_rate}%</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}