import React from 'react'

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  className?: string
  dot?: boolean
}

export default function StatusBadge({
  status,
  variant,
  className = '',
  dot = true,
}: StatusBadgeProps) {
  // Infer variant from string if not explicitly passed
  const normalized = status.toLowerCase().trim()
  let computedVariant: StatusVariant = variant || 'neutral'

  if (!variant) {
    if (['active', 'completed', 'paid', 'connected', 'success', 'published', 'verified'].includes(normalized)) {
      computedVariant = 'success'
    } else if (['pending', 'draft', 'partially paid', 'warning', 'in progress'].includes(normalized)) {
      computedVariant = 'warning'
    } else if (['cancelled', 'canceled', 'overdue', 'failed', 'inactive', 'error', 'disconnected'].includes(normalized)) {
      computedVariant = 'error'
    } else if (['info', 'processing', 'scheduled'].includes(normalized)) {
      computedVariant = 'info'
    }
  }

  const STYLES: Record<StatusVariant, { badge: string; dot: string }> = {
    success: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    warning: {
      badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    error: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
    },
    info: {
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      dot: 'bg-indigo-500',
    },
    neutral: {
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
  }

  const current = STYLES[computedVariant]

  return (
    <span className={`ciq-badge ${current.badge} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />}
      <span className="capitalize">{status}</span>
    </span>
  )
}
