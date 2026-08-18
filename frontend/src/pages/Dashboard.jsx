import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [kpi, setKpi] = useState(null);
  const [engagementChart, setEngagementChart] = useState([]);
  const [followersChart, setFollowersChart] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const [kpiRes, engRes, folRes] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/analytics/chart/engagement"),
        api.get("/analytics/chart/followers"),
      ]);
      setKpi(kpiRes.data);
      setEngagementChart(
        engRes.data.labels.map((label, i) => ({ date: label, value: engRes.data.values[i] }))
      );
      setFollowersChart(
        folRes.data.labels.map((label, i) => ({ date: label, value: folRes.data.values[i] }))
      );
    } catch {
      setError("Could not load dashboard data");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Overview</h1>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          {kpi && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <Stat label="Total Views" value={kpi.total_views?.toLocaleString()} />
              <Stat label="Total Likes" value={kpi.total_likes?.toLocaleString()} />
              <Stat label="Total Comments" value={kpi.total_comments?.toLocaleString()} />
              <Stat label="Total Shares" value={kpi.total_shares?.toLocaleString()} />
              <Stat label="Total Reach" value={kpi.total_reach?.toLocaleString()} />
              <Stat label="Total Followers" value={kpi.total_followers?.toLocaleString()} />
              <Stat label="Avg Engagement Rate" value={`${kpi.average_engagement_rate}%`} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow">
              <p className="mb-2 font-medium">Engagement Rate Trend</p>
              {engagementChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={engagementChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">No growth data yet. Add records via /growth.</p>
              )}
            </div>

            <div className="rounded-xl bg-white p-4 shadow">
              <p className="mb-2 font-medium">Follower Growth</p>
              {followersChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={followersChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">No growth data yet. Add records via /growth.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow sm:p-4">
      <p className="text-xs text-gray-500 sm:text-sm">{label}</p>
      <p className="text-lg font-bold sm:text-2xl">{value}</p>
    </div>
  );
}