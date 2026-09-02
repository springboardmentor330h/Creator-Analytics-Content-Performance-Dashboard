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

        setGrowthData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Growth API error:", err);

        setError(
          err.response?.data?.detail || "Unable to load growth analytics."
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
      <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="dashboard-hero">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">
                  Growth analytics
                </p>
                <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Growth & Trends</h1>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white/80 p-8 text-center shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <p className="text-slate-500">Loading growth analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="dashboard-hero">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">
                  Growth analytics
                </p>
                <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Growth & Trends</h1>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="font-medium text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="dashboard-hero">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">
                Growth analytics
              </p>
              <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Growth & Trends</h1>
              <p className="mt-2 text-sm text-indigo-100/90">Growth analytics for Creator {activeCreatorId}</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Performance Pulse
            </div>
          </div>
        </div>

        {growthData.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white/90 p-10 text-center shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <h2 className="text-xl font-semibold text-slate-800">No growth data available</h2>
            <p className="mt-2 text-slate-500">There is currently no growth analytics data available for Creator {activeCreatorId}.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
              <div className="stat-card stat-card-indigo">
                <p className="text-sm font-medium text-indigo-100">Followers</p>
                <h2 className="mt-5 text-3xl font-bold text-white">{summary.followers.toLocaleString()}</h2>
                <p className="mt-2 text-sm text-indigo-100/90">Current audience count</p>
              </div>

              <div className="stat-card stat-card-emerald">
                <p className="text-sm font-medium text-emerald-50">Daily Growth</p>
                <h2 className="mt-5 text-3xl font-bold text-white">+{summary.dailyGrowth.toLocaleString()}</h2>
                <p className="mt-2 text-sm text-emerald-50/90">New followers per day</p>
              </div>

              <div className="stat-card stat-card-sky">
                <p className="text-sm font-medium text-sky-50">Growth %</p>
                <h2 className="mt-5 text-3xl font-bold text-white">{summary.growthPercentage}%</h2>
                <p className="mt-2 text-sm text-sky-50/90">Growth momentum</p>
              </div>

              <div className="stat-card stat-card-dark">
                <p className="text-sm font-medium text-violet-100">Reach</p>
                <h2 className="mt-5 text-3xl font-bold text-white">{summary.reach.toLocaleString()}</h2>
                <p className="mt-2 text-sm text-violet-100/90">Audience reach</p>
              </div>

              <div className="stat-card stat-card-emerald">
                <p className="text-sm font-medium text-emerald-50">Engagement Rate</p>
                <h2 className="mt-5 text-3xl font-bold text-white">{summary.engagementRate}%</h2>
                <p className="mt-2 text-sm text-emerald-50/90">Interaction quality</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="dashboard-panel">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Follower Growth</h2>
                    <p className="mt-1 text-sm text-slate-500">Follower count over time</p>
                  </div>
                  <span className="chart-badge chart-badge-live">Followers</span>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <defs>
                        <linearGradient id="growthFollowers" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#2563eb" />
                          <stop offset="100%" stopColor="#60a5fa" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a", boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)" }} />
                      <Legend />
                      <Line type="monotone" dataKey="followers" name="Followers" stroke="url(#growthFollowers)" strokeWidth={3} dot={{ r: 3, fill: "#2563eb" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="dashboard-panel dashboard-panel-violet">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Reach Trend</h2>
                    <p className="mt-1 text-sm text-slate-500">Audience reach over time</p>
                  </div>
                  <span className="chart-badge chart-badge-revenue">Reach</span>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <defs>
                        <linearGradient id="growthReach" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#16a34a" />
                          <stop offset="100%" stopColor="#4ade80" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a", boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)" }} />
                      <Line type="monotone" dataKey="reach" name="Reach" stroke="url(#growthReach)" strokeWidth={3} dot={{ r: 3, fill: "#16a34a" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Engagement Rate</h2>
                  <p className="mt-1 text-sm text-slate-500">Interaction quality over time</p>
                </div>
                <span className="chart-badge chart-badge-live">Engagement</span>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <defs>
                      <linearGradient id="growthEngagement" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#9333ea" />
                        <stop offset="100%" stopColor="#c084fc" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a", boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)" }} />
                    <Line type="monotone" dataKey="engagement_rate" name="Engagement Rate" stroke="url(#growthEngagement)" strokeWidth={3} dot={{ r: 3, fill: "#9333ea" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="content-table-card">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Growth Analytics Data</h2>
                  <p className="mt-1 text-sm text-slate-500">Latest performance summary</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Live</span>
              </div>

              <div className="overflow-x-auto">
                <table className="dashboard-table w-full text-left">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Followers</th>
                      <th>Daily Growth</th>
                      <th>Growth %</th>
                      <th>Reach</th>
                      <th>Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {growthData.map((item, index) => (
                      <tr key={`${item.date}-${index}`}>
                        <td>{item.date}</td>
                        <td>{item.followers?.toLocaleString()}</td>
                        <td>+{item.daily_growth?.toLocaleString()}</td>
                        <td>{item.growth_percentage}%</td>
                        <td>{item.reach?.toLocaleString()}</td>
                        <td>{item.engagement_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default GrowthTrends;