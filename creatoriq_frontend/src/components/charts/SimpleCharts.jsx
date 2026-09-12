import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from 'recharts'
import { useTheme } from '../../context/ThemeContext'

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6']

// Fixed color per platform so legend always matches the slice
const PLATFORM_COLORS = {
  youtube: '#ef4444',
  instagram: '#ec4899',
  facebook: '#3b82f6',
  twitter: '#0ea5e9',
  x: '#0ea5e9',
  tiktok: '#14b8a6',
  linkedin: '#8b5cf6',
}

function colorFor(name, index) {
  const key = String(name || '').toLowerCase().trim()
  return PLATFORM_COLORS[key] || COLORS[index % COLORS.length]
}

// Recharts renders to inline SVG styles, which can't read Tailwind's
// `dark:` classes -- so chart colors are switched here in JS based on
// the same ThemeContext that toggles the `dark` class on <html>.
const PALETTE = {
  light: {
    grid: '#e2e8f0',
    axisText: '#64748b',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e2e8f0',
    tooltipText: '#0f172a',
    barCursor: '#f1f5f9',
    donutStroke: '#ffffff',
  },
  dark: {
    grid: '#334155',
    axisText: '#94a3b8',
    tooltipBg: '#1e293b',
    tooltipBorder: '#334155',
    tooltipText: '#f1f5f9',
    barCursor: '#334155',
    donutStroke: '#0f172a',
  },
}

/** 4900 → 4.9K, 1500000 → 1.5M */
export function formatCompact(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return `${Math.round(n)}`
}

function NiceTooltip({ active, payload, label, palette }) {
  if (!active || !payload?.length) return null
  const tip = {
    backgroundColor: palette.tooltipBg,
    border: `1px solid ${palette.tooltipBorder}`,
    borderRadius: 12,
    fontSize: 12,
    color: palette.tooltipText,
    boxShadow: '0 8px 24px rgba(15,23,42,0.16)',
  }
  return (
    <div style={tip} className="px-3 py-2">
      <p className="text-xs text-slate-500 mb-1 dark:text-slate-400">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color || palette.tooltipText }}>
          {p.name || p.dataKey}: {formatCompact(p.value)}
        </p>
      ))}
    </div>
  )
}

export function AreaTrend({ data, xKey = 'date', yKey = 'value', color = '#0ea5e9', height = 260 }) {
  const { isDark } = useTheme()
  const palette = isDark ? PALETTE.dark : PALETTE.light
  if (!data?.length) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: palette.axisText, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fill: palette.axisText, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={formatCompact}
        />
        <Tooltip content={<NiceTooltip palette={palette} />} />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#g-${color.replace('#', '')})`}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function SimpleBar({ data, xKey = 'name', yKey = 'value', color = '#0ea5e9', height = 260 }) {
  const { isDark } = useTheme()
  const palette = isDark ? PALETTE.dark : PALETTE.light
  if (!data?.length) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: palette.axisText, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fill: palette.axisText, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={formatCompact}
        />
        <Tooltip content={<NiceTooltip palette={palette} />} cursor={{ fill: palette.barCursor }} />
        <Bar dataKey={yKey} fill={color} radius={[8, 8, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GroupedBar({
  data,
  bars = [
    { key: 'Views', color: '#0ea5e9' },
    { key: 'Likes', color: '#10b981' },
    { key: 'Comments', color: '#f59e0b' },
  ],
  xKey = 'name',
  height = 280,
}) {
  const { isDark } = useTheme()
  const palette = isDark ? PALETTE.dark : PALETTE.light
  if (!data?.length) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: palette.axisText, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fill: palette.axisText, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={formatCompact}
        />
        <Tooltip content={<NiceTooltip palette={palette} />} cursor={{ fill: palette.barCursor }} />
        <Legend wrapperStyle={{ fontSize: 12, color: palette.axisText }} />
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} fill={b.color} radius={[4, 4, 0, 0]} maxBarSize={28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Donut({ data, height = 260 }) {
  const { isDark } = useTheme()
  const palette = isDark ? PALETTE.dark : PALETTE.light
  const rows = (data || []).filter((d) => Number(d.value) > 0)
  if (!rows.length) return <Empty />
  const total = rows.reduce((s, d) => s + Number(d.value || 0), 0) || 1
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={rows}
          dataKey="value"
          nameKey="name"
          innerRadius={58}
          outerRadius={88}
          paddingAngle={2}
          minAngle={8}
          stroke={palette.donutStroke}
          strokeWidth={2}
        >
          {rows.map((entry, i) => (
            <Cell key={`${entry.name}-${i}`} fill={colorFor(entry.name, i)} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0]
            const val = Number(item.value || 0)
            const pct = ((val / total) * 100).toFixed(1)
            return (
              <div
                style={{
                  background: palette.tooltipBg,
                  border: `1px solid ${palette.tooltipBorder}`,
                  borderRadius: 12,
                  padding: '8px 12px',
                  color: palette.tooltipText,
                  fontSize: 12,
                }}
              >
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div>
                  {formatCompact(val)} ({pct}%)
                </div>
              </div>
            )
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: palette.axisText }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function Empty() {
  return (
    <div className="h-60 flex items-center justify-center text-slate-400 text-sm dark:text-slate-500">
      No chart data yet — sync platforms first
    </div>
  )
}