import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Generic chart card. Pass `type="line"` or `type="bar"`, `data` as an
 * array of objects, `dataKey` for the x-axis field, and `lines`/`bars`
 * as an array of { key, color, label } for each series to plot.
 */
export default function ChartCard({ title, type = "line", data, dataKey, series = [] }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      {!hasData ? (
        <p className="py-10 text-center text-sm text-gray-400">No data available yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          {type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={dataKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {series.map((s) => (
                <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} />
              ))}
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={dataKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {series.map((s) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}