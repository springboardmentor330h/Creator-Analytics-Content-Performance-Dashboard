import React from 'react'
import PlatformIcon from '../PlatformIcon'
import ConnectionStatusBadge from './ConnectionStatusBadge'
import ConnectionActions from './ConnectionActions'
import { CheckCircle2, Database, Loader2, Radio } from 'lucide-react'

export interface PlatformConfig {
  key: string
  displayName: string
  isImplemented: boolean
  defaultScopes?: string
}

interface PlatformConnectionCardProps {
  platform: PlatformConfig
  status: 'connected' | 'disconnected'
  accountName?: string | null
  email?: string | null
  lastSync?: string | null
  connectionMode?: 'live' | 'manual' | string | null
  lastSyncedCount?: number | null
  permissions?: string | null
  profileUrl?: string | null
  onConnect: () => void
  onReconnect: () => void
  onRefresh: () => void
  onInfo: () => void
  onDisconnect: () => void
  onLiveAnalytics?: () => void
  isRefreshing?: boolean
  isReconnecting?: boolean
  isDisconnecting?: boolean
}

export const PlatformConnectionCard: React.FC<PlatformConnectionCardProps> = ({
  platform,
  status,
  accountName,
  email,
  lastSync,
  connectionMode = 'manual',
  lastSyncedCount,
  onConnect,
  onReconnect,
  onRefresh,
  onInfo,
  onDisconnect,
  onLiveAnalytics,
  isRefreshing = false,
  isReconnecting = false,
  isDisconnecting = false,
}) => {
  const isConnected = status === 'connected'
  const isLive = connectionMode === 'live' || platform.key === 'youtube'

  const formatLastSync = (iso?: string | null) => {
    if (!iso) return null
    try {
      const d = new Date(iso)
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return null
    }
  }

  const syncText = formatLastSync(lastSync)

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <PlatformIcon platform={platform.key} size={42} variant="subtle" />
          <div className="flex items-center gap-1.5">
            {isConnected && (
              isLive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live API
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  <Database className="w-2.5 h-2.5 text-slate-500" />
                  Manual Mode
                </span>
              )
            )}
            <ConnectionStatusBadge status={status} />
          </div>
        </div>

        {/* Platform Name */}
        <div className="mt-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {platform.displayName}
          </h3>
          {!isConnected && (
            <span className="text-[10px] font-semibold text-slate-400">
              {platform.key === 'youtube' ? 'OAuth 2.0 Live' : 'API Ready'}
            </span>
          )}
        </div>

        {/* Details or Description */}
        {isConnected ? (
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="font-semibold text-slate-800 truncate" title={accountName || ''}>
              {accountName || 'Connected Account'}
            </div>
            {email && (
              <div className="text-slate-500 truncate" title={email}>
                {email}
              </div>
            )}
            
            {/* Sync Feedback */}
            <div className="pt-1.5">
              {isRefreshing ? (
                <div className="text-indigo-600 font-semibold text-[11px] flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Syncing platform data...</span>
                </div>
              ) : syncText ? (
                <div className="text-slate-500 text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Last synced: {syncText}</span>
                  {typeof lastSyncedCount === 'number' && (
                    <span className="text-slate-400">({lastSyncedCount} items)</span>
                  )}
                </div>
              ) : (
                <div className="text-amber-600 text-[11px] flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>Connected • Click Sync to fetch initial data</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            Connect your {platform.displayName} account to sync metrics and track performance.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-5 mt-4 border-t border-slate-100">
        <ConnectionActions
          status={status}
          onConnect={onConnect}
          onReconnect={onReconnect}
          onRefresh={onRefresh}
          onInfo={onInfo}
          onDisconnect={onDisconnect}
          onLiveAnalytics={onLiveAnalytics}
          isRefreshing={isRefreshing}
          isReconnecting={isReconnecting}
          isDisconnecting={isDisconnecting}
        />
      </div>
    </div>
  )
}

export default PlatformConnectionCard
