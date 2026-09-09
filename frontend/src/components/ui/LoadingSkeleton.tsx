import React from 'react'

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`} />
}

export function KPISkeleton() {
  return (
    <div className="ciq-card !p-3.5 sm:!p-4 xl:!p-3.5 2xl:!p-4 animate-pulse min-w-0 w-full overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="h-3 w-16 sm:w-20 bg-slate-200 rounded" />
        <div className="h-7.5 w-7.5 sm:h-8 sm:w-8 bg-slate-200 rounded-xl shrink-0" />
      </div>
      <div className="mt-3 h-7 w-24 bg-slate-200 rounded" />
      <div className="mt-2 h-3 w-28 bg-slate-100 rounded" />
    </div>
  )
}

export function ChartSkeleton({ height = 'h-72' }: { height?: string }) {
  return (
    <div className={`ciq-card animate-pulse flex flex-col justify-between ${height}`}>
      <div className="flex items-center justify-between">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="h-7 w-24 bg-slate-100 rounded-lg" />
      </div>
      <div className="flex items-end gap-3 h-40 pt-6">
        <div className="w-full bg-slate-100 rounded-t h-1/3" />
        <div className="w-full bg-slate-100 rounded-t h-2/3" />
        <div className="w-full bg-slate-200 rounded-t h-full" />
        <div className="w-full bg-slate-100 rounded-t h-1/2" />
        <div className="w-full bg-slate-200 rounded-t h-3/4" />
        <div className="w-full bg-slate-100 rounded-t h-2/5" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="ciq-table-wrapper animate-pulse p-4 space-y-3">
      <div className="h-5 bg-slate-200 rounded w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-slate-100 rounded-lg w-full" />
      ))}
    </div>
  )
}
