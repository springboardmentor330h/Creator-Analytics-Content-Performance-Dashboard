import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import api from "../services/api";

function AudienceAnalytics() {
  const creatorId = 1;

  const [audienceData, setAudienceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAudienceAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/analytics/audience/${creatorId}`
        );

        console.log("Audience analytics:", response.data);

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

    fetchAudienceAnalytics();
  }, [creatorId]);

  if (loading) {
    return (
      <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[24px] border border-slate-200 bg-white/80 p-8 text-center shadow-sm">
            <p className="text-slate-500">
              Loading audience analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 shadow-sm">
            <h2 className="font-semibold text-red-700">
              Unable to load audience data
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!audienceData) {
    return (
      <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[28px] border border-slate-200 bg-white/90 p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-2xl">
              👥
            </div>

            <h2 className="text-xl font-semibold text-slate-800">
              No audience data available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There is currently no audience data for Creator {creatorId}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const genderData = Object.entries(
    audienceData.gender_distribution || {}
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const ageData = Object.entries(
    audienceData.age_distribution || {}
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const deviceData = Object.entries(
    audienceData.device_usage || {}
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const countryData = audienceData.top_countries || [];

  const cityData = audienceData.top_cities || [];

  const activeHoursData = audienceData.active_hours || [];

  const behavior = audienceData.audience_behavior || {};

  const pieColors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#10b981",
  ];

  return (
    <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="dashboard-hero">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">
                Audience insights
              </p>

              <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                Audience Analytics
              </h1>

              <p className="mt-2 text-sm text-indigo-100/90">
                Audience insights and engagement behavior for Creator{" "}
                {creatorId}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-100 shadow-lg backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Live Tracking
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          <div className="stat-card stat-card-indigo">
            <p className="text-sm font-medium text-indigo-100">
              Total Followers
            </p>

            <h2 className="mt-5 text-3xl font-bold text-white">
              {Number(
                audienceData.total_followers || 0
              ).toLocaleString()}
            </h2>

            <p className="mt-2 text-sm text-indigo-100/90">
              Current audience size
            </p>
          </div>

          <div className="stat-card stat-card-sky">
            <p className="text-sm font-medium text-sky-50">
              Total Reach
            </p>

            <h2 className="mt-5 text-3xl font-bold text-white">
              {Number(
                audienceData.total_reach || 0
              ).toLocaleString()}
            </h2>

            <p className="mt-2 text-sm text-sky-50/90">
              Audience reach
            </p>
          </div>

          <div className="stat-card stat-card-emerald">
            <p className="text-sm font-medium text-emerald-50">
              Total Impressions
            </p>

            <h2 className="mt-5 text-3xl font-bold text-white">
              {Number(
                audienceData.total_impressions || 0
              ).toLocaleString()}
            </h2>

            <p className="mt-2 text-sm text-emerald-50/90">
              Total impressions
            </p>
          </div>
        </div>

        {/* Audience Demographics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Gender */}
          <div className="dashboard-panel">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                Gender Distribution
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Audience distribution by gender
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) =>
                      `${name}: ${value}%`
                    }
                  >
                    {genderData.map((entry, index) => (
                      <Cell
                        key={`gender-${index}`}
                        fill={
                          pieColors[index % pieColors.length]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age */}
          <div className="dashboard-panel">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                Age Distribution
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Audience distribution by age group
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={105}
                    paddingAngle={2}
                  >
                    {ageData.map((entry, index) => (
                      <Cell
                        key={`age-${entry.name}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [`${value}%`, "Audience"]}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Geography + Devices */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Countries */}
          <div className="dashboard-panel">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                Top Countries
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Geographic distribution of the audience
              </p>
            </div>

            <div className="space-y-3">
              {countryData.map((item, index) => (
                <div
                  key={`${item.country}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <span className="font-medium text-slate-700">
                    {item.country}
                  </span>

                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div className="dashboard-panel">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                Top Cities
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Cities with the highest audience presence
              </p>
            </div>

            <div className="space-y-3">
              {cityData.map((item, index) => (
                <div
                  key={`${item.city}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <span className="font-medium text-slate-700">
                    {item.city}
                  </span>

                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-700">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Usage */}
        <div className="dark-analytics-panel">
          <div className="mb-5 flex items-center gap-3">
            <span className="text-xl text-violet-400">▱</span>
            <h2 className="text-lg font-semibold text-slate-100">
              Device Usage
            </h2>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceData} dataKey="value" nameKey="name" cx="30%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={1} stroke="none">
                  {deviceData.map((entry, index) => (
                    <Cell key={`device-${index}`} fill={["#ec3f93", "#3198f2", "#20d27b"][index % 3]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0b1325", border: "1px solid #263653", borderRadius: 8, color: "#e2e8f0" }} formatter={(value) => [`${value}%`, "Audience"]} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Hours */}
        <div className="dark-analytics-panel">
          <div className="mb-5 flex items-center gap-3">
            <span className="text-xl text-violet-400">▥</span>
            <h2 className="text-lg font-semibold text-slate-100">
              Active Hours
            </h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeHoursData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="activeHoursFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d2d4b" />
                <XAxis dataKey="hour" tickFormatter={(hour) => `${String(hour).padStart(2, "0")}:00`} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0b1325", border: "1px solid #263653", borderRadius: 8, color: "#e2e8f0" }} labelFormatter={(hour) => `${hour}:00`} />
                <Area type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} fill="url(#activeHoursFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audience Behavior */}
        <div className="dark-list-panel">
          <div className="mb-5 flex items-center gap-3">
            <span className="text-xl text-violet-400">∿</span>
            <h2 className="text-lg font-semibold text-slate-100">
              Audience Behavior
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">

            <div className="rounded-xl bg-[#0b1325] p-4">
              <p className="text-sm text-slate-400">
                Peak Active Hour
              </p>

              <p className="mt-2 text-xl font-bold text-violet-400">
                {behavior.peak_active_hour ?? "--"}:00
              </p>
            </div>

            <div className="rounded-xl bg-[#0b1325] p-4">
              <p className="text-sm text-slate-400">
                Peak Active Audience
              </p>

              <p className="mt-2 text-xl font-bold text-slate-100">
                {Number(behavior.peak_active_hour_count || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl bg-[#0b1325] p-4">
              <p className="text-sm text-slate-400">
                Top Device
              </p>

              <p className="mt-2 text-xl font-bold text-slate-100">
                {behavior.top_device || "--"}
              </p>
            </div>

            <div className="rounded-xl bg-[#0b1325] p-4">
              <p className="text-sm text-slate-400">
                Top Country
              </p>

              <p className="mt-2 text-xl font-bold text-slate-100">
                {behavior.top_country || "--"}
              </p>
            </div>

            <div className="rounded-xl bg-[#0b1325] p-4">
              <p className="text-sm text-slate-400">
                Top City
              </p>

              <p className="mt-2 text-xl font-bold text-slate-100">
                {behavior.top_city || "--"}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default AudienceAnalytics;

