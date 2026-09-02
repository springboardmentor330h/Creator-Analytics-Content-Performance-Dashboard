import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-[22px] border border-slate-700/60 bg-slate-950/50 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.3)]">
        <h2 className="mb-4 text-xl font-semibold text-white">Monthly Revenue</h2>
        <p className="text-slate-400">No monthly revenue data available.</p>
      </div>
    );
  }

  const chartColors = [
    "#8b5cf6",
    "#6366f1",
    "#3b82f6",
    "#22d3ee",
    "#34d399",
    "#f59e0b",
    "#f472b6",
    "#a78bfa",
  ];

  return (
    <div className="rounded-[22px] border border-slate-700/60 bg-slate-950/50 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.3)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Monthly Revenue</h2>
        <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-200">
          Revenue
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#cbd5e1", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
            contentStyle={{
              background: "#0f172a",
              border: "1px solid rgba(148,163,184,0.25)",
              borderRadius: 12,
              color: "#f8fafc",
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.35)",
            }}
          />
          <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`${entry.month}-${index}`} fill={chartColors[index % chartColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart;