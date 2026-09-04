export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  accent = 'sky',
}) {
  const format = (v) => {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return '—'
    const n = Number(v)
    if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'K'
    return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2)
  }

  const accents = {
    sky: { ring: 'from-sky-500/15 to-transparent', icon: 'bg-sky-50 text-sky-600' },
    emerald: { ring: 'from-emerald-500/15 to-transparent', icon: 'bg-emerald-50 text-emerald-600' },
    violet: { ring: 'from-violet-500/15 to-transparent', icon: 'bg-violet-50 text-violet-600' },
    amber: { ring: 'from-amber-500/15 to-transparent', icon: 'bg-amber-50 text-amber-600' },
    rose: { ring: 'from-rose-500/15 to-transparent', icon: 'bg-rose-50 text-rose-600' },
  }
  const a = accents[accent] || accents.sky

  return (
    <div className={`ciq-card relative overflow-hidden p-4 hover:shadow-md transition-shadow`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.ring}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {format(value)}
          </p>
          {(subtitle || trend != null) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              {trend != null && (
                <span
                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-medium ${
                    trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
              )}
              {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${a.icon}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  )
}
