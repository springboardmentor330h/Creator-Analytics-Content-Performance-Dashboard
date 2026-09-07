import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusMessage";

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

function toChartData(distribution) {
  return Object.entries(distribution || {}).map(([name, value]) => ({ name, value }));
}

export default function AudienceAnalytics() {
  const { user } = useAuth();
  const [demographics, setDemographics] = useState(null);
  const [locations, setLocations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/analytics/audience/${user.id}`),
      api.get(`/analytics/audience/${user.id}/locations`),
    ])
      .then(([demoRes, locRes]) => {
        setDemographics(demoRes.data);
        setLocations(locRes.data);
      })
      .catch(() => setError("Couldn't load audience analytics."))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState label="Loading audience data..." />;
  if (error) return <ErrorState message={error} />;

  const ageData = toChartData(demographics?.age_distribution);
  const genderData = toChartData(demographics?.gender_distribution);
  const deviceData = toChartData(demographics?.device_distribution);

  const renderPie = (title, data) => (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">{title}</h2>
      {data.length === 0 ? (
        <EmptyState message="No data yet." />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Audience Analytics</h1>
        <p className="text-sm text-slate-400">
          {demographics?.total_followers?.toLocaleString() ?? 0} total followers across platforms.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {renderPie("Age Distribution", ageData)}
        {renderPie("Gender Distribution", genderData)}
        {renderPie("Device Usage", deviceData)}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Top Countries</h2>
          {(locations?.top_countries?.length ?? 0) === 0 ? (
            <EmptyState />
          ) : locations.top_countries.map((c, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
              <span className="text-slate-700">{c.country}</span>
              <span className="text-slate-400">{c.count}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Top Cities</h2>
          {(locations?.top_cities?.length ?? 0) === 0 ? (
            <EmptyState />
          ) : locations.top_cities.map((c, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
              <span className="text-slate-700">{c.city}</span>
              <span className="text-slate-400">{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
