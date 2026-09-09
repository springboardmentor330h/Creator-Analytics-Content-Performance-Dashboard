import React from 'react'
import { Database, Radio, Sparkles } from 'lucide-react'

export type AnalyticsDataSource = 'database' | 'live'

interface AnalyticsSourceToggleProps {
  value: AnalyticsDataSource
  onChange: (source: AnalyticsDataSource) => void
  connectedCount?: number
  disabled?: boolean
}

export default function AnalyticsSourceToggle({
  value,
  onChange,
  connectedCount = 0,
  disabled = false,
}: AnalyticsSourceToggleProps) {
  const isLive = value === 'live'

  return (
    <div
      role="radiogroup"
      aria-label="Analytics Data Source Switcher"
      className="inline-flex items-center rounded-2xl bg-slate-100/90 p-1.5 border border-slate-200 shadow-2xs transition-all duration-200"
    >
      {/* Database Mode Button */}
      <button
        type="button"
        role="radio"
        aria-checked={!isLive}
        disabled={disabled}
        onClick={() => onChange('database')}
        className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
          !isLive
            ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        <Database className={`h-3.5 w-3.5 transition-colors ${!isLive ? 'text-blue-600' : 'text-slate-400'}`} />
        <span>Saved Analytics</span>
      </button>

      {/* Live Social API Mode Button */}
      <button
        type="button"
        role="radio"
        aria-checked={isLive}
        disabled={disabled}
        onClick={() => onChange('live')}
        className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
          isLive
            ? 'bg-slate-900 text-white shadow-xs border border-slate-800 font-extrabold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        <div className="relative flex h-2 w-2 items-center justify-center">
          {isLive && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full transition-colors ${
              isLive ? 'bg-emerald-400' : 'bg-slate-400'
            }`}
          />
        </div>
        <Radio className={`h-3.5 w-3.5 transition-colors ${isLive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
        <span>Live Social API</span>

        {connectedCount > 0 && (
          <span
            className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold tracking-tight transition-colors ${
              isLive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {connectedCount} Live
          </span>
        )}
      </button>
    </div>
  )
}
