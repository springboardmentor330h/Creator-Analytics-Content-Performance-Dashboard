import React from 'react'

interface ConnectionStatusBadgeProps {
  status: 'connected' | 'disconnected' | string
  className?: string
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({ status, className = '' }) => {
  const isConnected = status?.toLowerCase() === 'connected'

  if (isConnected) {
    return (
      <span
        className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#e8f7ed] text-[#16a34a] border border-[#d2f3dc] select-none ${className}`}
      >
        Connected
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/80 select-none ${className}`}
    >
      Disconnected
    </span>
  )
}

export default ConnectionStatusBadge
