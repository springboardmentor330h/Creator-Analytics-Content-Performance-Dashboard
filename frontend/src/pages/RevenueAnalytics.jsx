import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, BarChart2, Award, ClipboardList } from "lucide-react";
import api from "../api/axios";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import { LoadingState, EmptyState, ErrorState } from "../components/States";

const COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#3b82f6", "#8b5cf6"];

export default function RevenueAnalytics() {
  const [revenues, setRevenues] = useState([]);
  const [summary, setSummary] = useState(null);
  const [bySource, setBySource] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get("/revenue"),
      api.get("/revenue/analytics/summary"),
      api.get("/revenue/analytics/by-source"),
      api.get("/revenue/analytics/monthly"),
      api.get("/revenue/analytics/trend"),
    ])
      .then(([revRes, summaryRes, bySourceRes, monthlyRes, trendRes]) => {
        setRevenues(Array.isArray(revRes.data) ? revRes.data : []);
        setSummary(summaryRes.data);
        setBySource(Array.isArray(bySourceRes.data) ? bySourceRes.data : []);
        setMonthly(Array.isArray(monthlyRes.data) ? monthlyRes.data : []);
        setTrend(Array.isArray(trendRes.data) ? trendRes.data : []);
      })
      .catch(() => setError("Unable to load revenue data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (v) => {
    if (v === null || v === undefined) return "-";
    return `$${Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Layout>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={fetchData} />}

      {!loading && !error && (
        <>
          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Revenue" value={formatCurrency(summary.total_revenue)} icon={<DollarSign size={22} />} color="green" />
              <StatCard label="Avg Revenue" value={formatCurrency(summary.avg_revenue)} icon={<BarChart2 size={22} />} color="blue" />
              <StatCard label="Max Revenue" value={formatCurrency(summary.max_revenue)} icon={<Award size={22} />} color="orange" />
              <StatCard label="Total Records" value={summary.total_count || revenues.length} icon={<ClipboardList size={22} />} color="indigo" />
            </div>
          )}

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Monthly Revenue Bar */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-700 mb-4">Monthly Revenue</h3>
              {monthly.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="total" fill="#6366f1" name="Revenue" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No monthly revenue data." />
              )}
            </div>

            {/* Revenue by Source Pie */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-700 mb-4">By Source</h3>
              {bySource.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={bySource}
                      dataKey="total"
                      nameKey="source"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
                    >
                      {bySource.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No source data." />
              )}
            </div>
          </div>

          {/* Revenue Trend Line */}
          {trend.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
              <h3 className="text-base font-semibold text-gray-700 mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v?.slice(0, 7) || v} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#14b8a6" strokeWidth={2} dot={false} name="Amount" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Revenue records table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-700 mb-4">Revenue Records</h3>
            {revenues.length === 0 ? (
              <EmptyState message="No revenue records yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-3 pr-4 font-medium">Source</th>
                      <th className="pb-3 pr-4 font-medium">Amount</th>
                      <th className="pb-3 pr-4 font-medium">Description</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenues.map((r, i) => (
                      <tr key={r.id || i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="py-3 pr-4 font-medium text-gray-800">{r.source || "-"}</td>
                        <td className="py-3 pr-4 text-green-600 font-semibold">{formatCurrency(r.amount)}</td>
                        <td className="py-3 pr-4 text-gray-500 max-w-[200px] truncate">{r.description || "-"}</td>
                        <td className="py-3 text-gray-500">{r.revenue_date || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
