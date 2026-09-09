import React from 'react'
import { RefreshCw, Info, Loader2 } from 'lucide-react'

interface ConnectionActionsProps {
  status: 'connected' | 'disconnected' | string
  onConnect: () => void
  onReconnect: () => void
  onRefresh: () => void
  onInfo: () => void
  onDisconnect: () => void
  onLiveAnalytics?: () => void
  isRefreshing?: boolean
  isReconnecting?: boolean
  isDisconnecting?: boolean
  isConnecting?: boolean
}

export const ConnectionActions: React.FC<ConnectionActionsProps> = ({
  status,
  onConnect,
  onReconnect,
  onRefresh,
  onInfo,
  onDisconnect,
  onLiveAnalytics,
  isRefreshing = false,
  isReconnecting = false,
  isDisconnecting = false,
  isConnecting = false,
}) => {
  const isConnected = status?.toLowerCase() === 'connected'

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 pt-3 flex-wrap">
        {/* Live Analytics button */}
        {onLiveAnalytics && (
          <button
            type="button"
            onClick={onLiveAnalytics}
            title="Open real-time live platform analytics"
            aria-label="View live analytics"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>Live Analytics</span>
          </button>
        )}

        {/* Reconnect button */}
        <button
          type="button"
          onClick={onReconnect}
          disabled={isReconnecting || isRefreshing || isDisconnecting}
          aria-label="Reconnect platform account"
          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
        >
          {isReconnecting ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
              <span>Reconnecting...</span>
            </span>
          ) : (
            'Reconnect'
          )}
        </button>

        {/* Sync button with text & state */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing || isReconnecting || isDisconnecting}
          title="Synchronize platform content and analytics"
          aria-label="Synchronize platform content and analytics"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
        </button>

        {/* Disconnect button */}
        <button
          type="button"
          onClick={onDisconnect}
          disabled={isDisconnecting || isRefreshing || isReconnecting}
          aria-label="Disconnect platform account"
          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
        >
          {isDisconnecting ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
              <span>Disconnecting...</span>
            </span>
          ) : (
            'Disconnect'
          )}
        </button>

        {/* Info icon button */}
        <button
          type="button"
          onClick={onInfo}
          title="Connection details & permissions"
          aria-label="View connection details & permissions"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-2xs ml-auto"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="pt-3">
      <button
        type="button"
        onClick={onConnect}
        disabled={isConnecting}
        aria-label="Connect platform account"
        className="inline-flex items-center justify-center px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-all shadow-xs hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Connecting...</span>
          </span>
        ) : (
          'Connect'
        )}
      </button>
    </div>
  )
}

export default ConnectionActions
