export default function KPICard({ title, value, subtitle }) {
  const format = (v) => {
    if (v === null || v === undefined) return '—'
    if (typeof v === 'number') {
      if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
      if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(1) + 'K'
      return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(2)
    }
    return v
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-semibold tracking-tight">{format(value)}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  )
}
