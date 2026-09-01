export default function KPICard({ title, value, subtitle, accent = 'sky' }) {
  const format = (v) => {
    if (v === null || v === undefined || Number.isNaN(v)) return '—'
    if (typeof v === 'number') {
      if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
      if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(1) + 'K'
      return Number.isInteger(v) ? v.toLocaleString() : Number(v).toFixed(2)
    }
    return v
  }

  const accents = {
    sky: 'from-sky-50 to-white border-sky-100',
    emerald: 'from-emerald-50 to-white border-emerald-100',
    violet: 'from-violet-50 to-white border-violet-100',
    amber: 'from-amber-50 to-white border-amber-100',
  }

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${accents[accent] || accents.sky}`}>
      <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-semibold tracking-tight text-slate-900">{format(value)}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  )
}
