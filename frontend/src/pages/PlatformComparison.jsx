import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api/axios";
import Layout from "../components/Layout";
import { LoadingState, EmptyState, ErrorState } from "../components/States";

const PLATFORM_COLORS = {
  instagram: "#ec4899",
  youtube: "#ef4444",
  tiktok: "#1a1a1a",
  twitter: "#3b82f6",
  facebook: "#6366f1",
};

const getPlatformColor = (platform) =>
  PLATFORM_COLORS[(platform || "").toLowerCase()] || "#6366f1";

export default function PlatformComparison() {
  const [comparison, setComparison] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get("/analytics/platform-comparison"),
      api.get("/analytics/platform-performance"),
    ])
      .then(([compRes, perfRes]) => {
        setComparison(Array.isArray(compRes.data) ? compRes.data : []);
        setPerformance(Array.isArray(perfRes.data) ? perfRes.data : []);
      })
      .catch(() => setError("Unable to load platform data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatNum = (n) => {
    if (!n && n !== 0) return "-";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const metricKeys = comparison.length
    ? Object.keys(comparison[0]).filter(
        (k) => k !== "platform" && typeof comparison[0][k] === "number"
      )
    : [];

  return (
    <Layout>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={fetchData} />}

      {!loading && !error && (
        <>
          {comparison.length === 0 && performance.length === 0 ? (
            <EmptyState message="No platform data yet." />
          ) : (
            <>
              {/* Comparison Bar Charts */}
              {comparison.length > 0 && metricKeys.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                  <h3 className="text-base font-semibold text-gray-700 mb-4">
                    Platform Metrics Comparison
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {metricKeys.slice(0, 4).map((metric) => (
                      <div key={metric}>
                        <p className="text-xs text-gray-500 capitalize mb-2">
                          {metric.replace(/_/g, " ")}
                        </p>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={comparison}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatNum(v)} />
                            <Tooltip formatter={(v) => formatNum(v)} />
                            <Bar
                              dataKey={metric}
                              name={metric.replace(/_/g, " ")}
                              radius={[4, 4, 0, 0]}
                              fill="#6366f1"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary comparison table */}
              {comparison.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                  <h3 className="text-base font-semibold text-gray-700 mb-4">
                    Platform Summary Table
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-100">
                          <th className="pb-3 pr-4 font-medium">Platform</th>
                          {metricKeys.map((k) => (
                            <th key={k} className="pb-3 pr-4 font-medium capitalize">
                              {k.replace(/_/g, " ")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.map((row, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="py-3 pr-4">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                style={{ background: getPlatformColor(row.platform) }}
                              >
                                {row.platform}
                              </span>
                            </td>
                            {metricKeys.map((k) => (
                              <td key={k} className="py-3 pr-4 text-gray-700">
                                {formatNum(row[k])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Platform Performance Cards */}
              {performance.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-base font-semibold text-gray-700 mb-4">
                    Platform Performance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {performance.map((p, i) => (
                      <div
                        key={i}
                        className="border border-gray-100 rounded-lg p-4"
                        style={{
                          borderLeftColor: getPlatformColor(p.platform),
                          borderLeftWidth: 4,
                        }}
                      >
                        <p
                          className="text-sm font-semibold mb-3"
                          style={{ color: getPlatformColor(p.platform) }}
                        >
                          {p.platform}
                        </p>
                        {Object.entries(p)
                          .filter(([k, v]) => k !== "platform" && v !== null && v !== undefined)
                          .map(([k, v]) => (
                            <div
                              key={k}
                              className="flex justify-between text-sm py-1 border-b border-gray-50"
                            >
                              <span className="text-gray-500 capitalize">
                                {k.replace(/_/g, " ")}
                              </span>
                              <span className="font-medium text-gray-800">{formatNum(v)}</span>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </Layout>
  );
}
