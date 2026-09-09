import React from 'react'
import PlatformIcon from '../PlatformIcon'
import { Layers } from 'lucide-react'

export interface PlatformOption {
  id: string
  name: string
}

export const DEFAULT_PLATFORMS: PlatformOption[] = [
  { id: 'All', name: 'All' },
  { id: 'YouTube', name: 'YouTube' },
  { id: 'Instagram', name: 'Instagram' },
  { id: 'TikTok', name: 'TikTok' },
  { id: 'Facebook', name: 'Facebook' },
  { id: 'X', name: 'X (Twitter)' },
  { id: 'LinkedIn', name: 'LinkedIn' },
]

interface PlatformSelectorProps {
  selected: string
  onChange: (platformId: string) => void
  platforms?: PlatformOption[]
  className?: string
  showLabels?: boolean
}

export default function PlatformSelector({
  selected,
  onChange,
  platforms = DEFAULT_PLATFORMS,
  className = '',
  showLabels = false,
}: PlatformSelectorProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl border border-slate-200/90 bg-white p-1 shadow-2xs overflow-x-auto max-w-full ${className}`}
      role="tablist"
      aria-label="Platform Selector"
    >
      {platforms.map((p) => {
        const isSelected = selected.toLowerCase() === p.id.toLowerCase()
        const isAll = p.id === 'All'

        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(p.id)}
            title={p.name}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-150 shrink-0 ${
              isSelected
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {isAll ? (
              <Layers className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <div className="flex h-3.5 w-3.5 items-center justify-center shrink-0">
                <PlatformIcon platform={p.id} className="h-3.5 w-3.5" />
              </div>
            )}
            <span className={showLabels || isAll ? 'inline' : 'hidden sm:inline'}>{p.name}</span>
          </button>
        )
      })}
    </div>
  )
}
