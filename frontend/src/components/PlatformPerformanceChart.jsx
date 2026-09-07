import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function PlatformPerformanceChart({ data }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="platform" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="total_views"
            fill="#2563eb"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PlatformPerformanceChart