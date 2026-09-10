import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "../components/StatusMessage";

const COLORS = [
  "#4f46e5",
  "#6366f1",
  "#818cf8",
  "#a5b4fc",
  "#c7d2fe",
  "#e0e7ff",
];

function toChartData(distribution) {
  return Object.entries(distribution || {}).map(([name, value]) => ({
    name,
    value: Number(value),
  }));
}

function CustomLegend({ payload }) {
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 px-2">
      {payload?.map((entry, index) => (
        <div
          key={`legend-${index}`}
          className="flex items-center gap-1.5 text-xs text-slate-500"
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />

          <span>{entry.value}</span>

          <span className="font-medium text-slate-700">
            {entry.payload?.value ?? 0}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AudienceAnalytics() {
  const { user } = useAuth();

  const [demographics, setDemographics] = useState(null);
  const [locations, setLocations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError("");

    Promise.all([
      api.get(`/analytics/audience/${user.id}`),
      api.get(`/analytics/audience/${user.id}/locations`),
    ])
      .then(([demoRes, locRes]) => {
        setDemographics(demoRes.data);
        setLocations(locRes.data);
      })
      .catch(() => {
        setError("Couldn't load audience analytics.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return <LoadingState label="Loading audience data..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const ageData = toChartData(demographics?.age_distribution);
  const genderData = toChartData(demographics?.gender_distribution);
  const deviceData = toChartData(demographics?.device_distribution);

  const renderPie = (title, data) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-slate-800">
        {title}
      </h2>

      {data.length === 0 ? (
        <div className="flex h-[270px] items-center justify-center">
          <EmptyState message="No data yet." />
        </div>
      ) : (
        <div className="h-[285px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="42%"
                outerRadius={76}
                innerRadius={0}
                paddingAngle={1}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [
                  `${value}%`,
                  name,
                ]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                }}
              />

              <Legend
                verticalAlign="bottom"
                align="center"
                content={<CustomLegend />}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Audience Analytics
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          {demographics?.total_followers?.toLocaleString() ?? 0} total
          followers across platforms.
        </p>
      </div>

      {/* DEMOGRAPHIC CHARTS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {renderPie("Age Distribution", ageData)}
        {renderPie("Gender Distribution", genderData)}
        {renderPie("Device Usage", deviceData)}
      </div>

      {/* LOCATIONS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* TOP COUNTRIES */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-800">
              Top Countries
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Audience distribution by country
            </p>
          </div>

          {(locations?.top_countries?.length ?? 0) === 0 ? (
            <EmptyState message="No country data yet." />
          ) : (
            <div className="space-y-1">
              {locations.top_countries.map((country, index) => (
                <div
                  key={`${country.country}-${index}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-600">
                      {index + 1}
                    </span>

                    <span className="text-sm font-medium text-slate-700">
                      {country.country}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-slate-500">
                    {country.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOP CITIES */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-800">
              Top Cities
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Audience distribution by city
            </p>
          </div>

          {(locations?.top_cities?.length ?? 0) === 0 ? (
            <EmptyState message="No city data yet." />
          ) : (
            <div className="space-y-1">
              {locations.top_cities.map((city, index) => (
                <div
                  key={`${city.city}-${index}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-600">
                      {index + 1}
                    </span>

                    <span className="text-sm font-medium text-slate-700">
                      {city.city}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-slate-500">
                    {city.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}