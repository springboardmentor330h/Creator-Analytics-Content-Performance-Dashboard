import { useEffect, useState } from "react";
import api from "../api/axios";
import { LoadingState, ErrorState, EmptyState } from "../components/LoadingState";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function PlatformComparison() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get("/analytics/platform-comparison")
      .then((res) => {
        // Backend returns a dict keyed by platform: { "YouTube": {...}, "Instagram": {...} }
        // Convert it into an array for charts/tables to consume.
        const arr = Object.entries(res.data).map(([platform, stats]) => ({
          platform,
          views: stats.views,
          likes: stats.likes,
          comments: stats.comments,
          reach: stats.reach,
          engagement_rate: stats.engagement_rate,
        }));
        setData(arr);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (data.length === 0) return <EmptyState />;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Platform Comparison</h2>

      <div className="p-6 mb-8 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Engagement Rate by Platform</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <XAxis dataKey="platform" /><YAxis />
            <Tooltip contentStyle={{ borderRadius: "12px" }} /><Legend />
            <Bar dataKey="engagement_rate" name="Engagement Rate (%)" fill="#3b6fed" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100 dark:text-gray-500 dark:border-gray-700">
              <th className="py-2">Platform</th><th className="py-2">Views</th><th className="py-2">Likes</th><th className="py-2">Comments</th><th className="py-2">Reach</th><th className="py-2">Engagement Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.platform} className="border-b border-gray-50 dark:border-gray-700/50">
                <td className="py-2 font-medium text-gray-800 dark:text-gray-200">{p.platform}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{p.views.toLocaleString()}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{p.likes.toLocaleString()}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{p.comments.toLocaleString()}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{p.reach.toLocaleString()}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{p.engagement_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}