import { useEffect, useState } from "react";
import api from "../api/axios";
import KpiCard from "../components/KpiCard";
import { LoadingState, ErrorState } from "../components/LoadingState";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Eye, Heart, Share2, Users, MessageCircle, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topContent, setTopContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/summary"),
      api.get("/analytics/chart/followers"),
      api.get("/analytics/top-content"),
    ]).then(([s, c, t]) => {
      setSummary(s.data);
      setChartData(c.data.labels.map((l, i) => ({ date: l, followers: c.data.values[i] })));
      setTopContent(t.data.data);
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">Your performance across all connected platforms</p>

      <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
        <KpiCard label="Total Views" value={summary.total_views.toLocaleString()} icon={Eye} color="blue" />
        <KpiCard label="Total Likes" value={summary.total_likes.toLocaleString()} icon={Heart} color="pink" />
        <KpiCard label="Total Reach" value={summary.total_reach.toLocaleString()} icon={Share2} color="orange" />
        <KpiCard label="Followers" value={summary.total_followers.toLocaleString()} icon={Users} color="green" />
        <KpiCard label="Comments" value={summary.total_comments.toLocaleString()} icon={MessageCircle} color="purple" />
        <KpiCard label="Shares" value={summary.total_shares.toLocaleString()} icon={Share2} color="blue" />
        <KpiCard label="Engagement Rate" value={`${summary.average_engagement_rate}%`} icon={TrendingUp} color="green" />
      </div>

      <div className="p-6 mb-8 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Follower Growth</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-700" />
            <XAxis dataKey="date" hide />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
            <Line type="monotone" dataKey="followers" stroke="#3b6fed" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Top Performing Content</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100 dark:text-gray-500 dark:border-gray-700">
              <th className="py-2 font-medium">Title</th><th className="py-2 font-medium">Platform</th>
              <th className="py-2 font-medium">Views</th><th className="py-2 font-medium">Engagement</th>
            </tr>
          </thead>
          <tbody>
            {topContent.map((c, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50">
                <td className="py-3 text-gray-800 dark:text-gray-200">{c.content_title}</td>
                <td className="py-3"><span className="px-2.5 py-1 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400 rounded-full text-xs font-medium">{c.platform}</span></td>
                <td className="py-3 text-gray-600 dark:text-gray-400">{c.views.toLocaleString()}</td>
                <td className="py-3 text-gray-600 dark:text-gray-400">{c.engagement_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}