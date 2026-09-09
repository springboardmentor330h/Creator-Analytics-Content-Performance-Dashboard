import React from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
  children: React.ReactNode
  className?: string
  minHeight?: string
}

export default function ChartCard({
  title,
  subtitle,
  action,
  loading = false,
  empty = false,
  emptyMessage = 'No chart data available for the selected period.',
  children,
  className = '',
  minHeight = 'min-h-[280px]',
}: ChartCardProps) {
  return (
    <div className={`ciq-card flex flex-col ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className={`relative flex-1 w-full ${minHeight} flex flex-col justify-center`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full w-full py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <span className="mt-3 text-xs font-medium text-slate-500">Loading analytics...</span>
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center h-full w-full py-12 text-center text-slate-400">
            <p className="text-xs">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
