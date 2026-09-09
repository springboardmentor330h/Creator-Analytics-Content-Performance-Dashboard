import React from 'react'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number
  changeLabel?: string
  subtitle?: string
  color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'blue' | 'slate'
  loading?: boolean
}

const COLOR_VARIANTS: Record<string, { bg: string; text: string }> = {
  indigo: { bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-600' },
  emerald: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600' },
  rose: { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-600' },
  amber: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600' },
  blue: { bg: 'bg-sky-50 border-sky-100', text: 'text-sky-600' },
  slate: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700' },
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel = 'vs last period',
  subtitle,
  color = 'slate',
  loading = false,
}: KPICardProps) {
  const variant = COLOR_VARIANTS[color] || COLOR_VARIANTS.slate

  if (loading) {
    return (
      <div className="ciq-card !p-3.5 sm:!p-4 xl:!p-3.5 2xl:!p-4 animate-pulse min-w-0 w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 w-16 sm:w-20 bg-slate-200 rounded" />
          <div className="h-8 w-8 sm:h-8.5 sm:w-8.5 bg-slate-200 rounded-xl shrink-0" />
        </div>
        <div className="mt-3 h-7 w-24 bg-slate-200 rounded" />
        <div className="mt-2 h-3 w-28 bg-slate-100 rounded" />
      </div>
    )
  }

  const isPositive = typeof change === 'number' && change > 0
  const isNegative = typeof change === 'number' && change < 0

  const displayValue = typeof value === 'number' ? value.toLocaleString() : String(value ?? '')
  const valLength = displayValue.length

  // Dynamically calculate font size tailored to text length so it never overflows the card
  let fontSizeClass = 'text-2xl sm:text-3xl'
  if (valLength > 13) {
    fontSizeClass = 'text-base sm:text-lg 2xl:text-base'
  } else if (valLength > 10) {
    fontSizeClass = 'text-lg sm:text-xl 2xl:text-lg'
  } else if (valLength > 8) {
    fontSizeClass = 'text-xl sm:text-2xl 2xl:text-xl'
  } else if (valLength > 6) {
    fontSizeClass = 'text-2xl sm:text-2xl 2xl:text-2xl'
  }

  return (
    <div className="ciq-card !p-3.5 sm:!p-4 xl:!p-3.5 2xl:!p-4 group hover:border-slate-300 min-w-0 w-full overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-1 min-w-0">
          <span
            className="text-[9.5px] sm:text-[10px] 2xl:text-[11px] font-bold uppercase tracking-tight text-slate-500 truncate"
            title={title}
          >
            {title}
          </span>
          <div
            className={`flex h-7.5 w-7.5 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl border ${variant.bg} ${variant.text} transition-transform group-hover:scale-105 shadow-2xs`}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2 sm:mt-2.5 min-w-0 w-full overflow-hidden">
          <span
            className={`${fontSizeClass} font-extrabold text-slate-900 leading-tight tracking-tight truncate block w-full`}
            title={displayValue}
          >
            {displayValue}
          </span>
        </div>
      </div>

      {(typeof change === 'number' || subtitle) && (
        <div className="mt-2 sm:mt-2.5 flex items-center gap-1.5 text-[10px] sm:text-xs min-w-0 overflow-hidden">
          {typeof change === 'number' && (
            <span
              className={`inline-flex items-center gap-0.5 font-bold shrink-0 ${
                isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              ) : isNegative ? (
                <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              ) : (
                <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              )}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
          )}
          <span
            className="text-slate-500 truncate text-[10px] sm:text-[11px] font-medium min-w-0"
            title={subtitle || changeLabel}
          >
            {subtitle || changeLabel}
          </span>
        </div>
      )}
    </div>
  )
}
