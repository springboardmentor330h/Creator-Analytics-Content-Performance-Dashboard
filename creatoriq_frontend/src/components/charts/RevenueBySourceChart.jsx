import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function RevenueBySourceChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-[22px] border border-slate-700/60 bg-slate-950/50 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.3)]">
        <h2 className="mb-4 text-xl font-semibold text-white">Revenue by Source</h2>
        <p className="text-slate-400">No revenue source data available.</p>
      </div>
    );
  }

  const colors = ["#8b5cf6", "#ec4899", "#22d3ee", "#34d399", "#fbbf24"];

  return (
    <div className="rounded-[22px] border border-slate-700/60 bg-slate-950/50 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.3)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Revenue by Source</h2>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
          Split
        </span>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="source"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={100}
            paddingAngle={4}
            stroke="rgba(15, 23, 42, 0.9)"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`${entry.source}-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
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
          <Legend
            wrapperStyle={{ paddingTop: 12, color: "#e2e8f0" }}
            formatter={(name) => <span style={{ color: "#e2e8f0", fontSize: 12 }}>{name}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueBySourceChart;