import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Radio,
  RefreshCw,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react'
import PlatformIcon from '../PlatformIcon'
import { analyticsApi } from '../../services/api'

interface LiveModeBannerProps {
  mode: 'database' | 'live'
  connectedPlatforms: string[]
  disconnectedPlatforms: string[]
  selectedPlatform: string
  onSyncComplete?: () => void
  onRefresh?: () => void
  lastRefreshedAt?: string
}

export default function LiveModeBanner({
  mode,
  connectedPlatforms,
  disconnectedPlatforms,
  selectedPlatform,
  onSyncComplete,
  onRefresh,
  lastRefreshedAt,
}: LiveModeBannerProps) {
  const [syncing, setSyncing] = useState(false)
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const isLive = mode === 'live'
  const isAll = selectedPlatform === 'All'
  const isSelectedConnected = isAll || connectedPlatforms.some(
    (p) => p.toLowerCase() === selectedPlatform.toLowerCase()
  )

  const handleSyncLive = async () => {
    try {
      setSyncing(true)
      setSyncFeedback(null)
      const res = await analyticsApi.syncLive()
      const data = res.data
      setSyncFeedback({
        type: 'success',
        message: data?.message || `Successfully synced live data into database!`,
      })
      if (onSyncComplete) onSyncComplete()
      setTimeout(() => setSyncFeedback(null), 5000)
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to sync live data into database.'
      setSyncFeedback({ type: 'error', message: typeof msg === 'string' ? msg : JSON.stringify(msg) })
      setTimeout(() => setSyncFeedback(null), 5000)
    } finally {
      setSyncing(false)
    }
  }

  const formatTime = (iso?: string) => {
    if (!iso) return 'Just now'
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
      return 'Just now'
    }
  }

  if (!isLive) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-600 transition-all">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100/70 text-blue-700">
            <Database className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-800">Source: Saved Platform Analytics</span>
            <span className="ml-2 text-slate-400 hidden sm:inline">|</span>
            <span className="ml-2 text-slate-500 hidden sm:inline">
              Reading persistent database records across all creator accounts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Fully Indexed
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Live Stream Status Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/50 p-4 shadow-xs transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left info */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
              <Radio className="h-5 w-5 animate-pulse text-emerald-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  Live API Feed
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Real-Time Connected Social Accounts Stream
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">
                Metrics calculated directly from active social media connections.
                {lastRefreshedAt && (
                  <span className="text-slate-400 ml-1">Last refreshed at {formatTime(lastRefreshedAt)}.</span>
                )}
              </p>
            </div>
          </div>

          {/* Right Actions: Sync to PostgreSQL & Refresh */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Fetch latest API stream"
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Refresh Live</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSyncLive}
              disabled={syncing || connectedPlatforms.length === 0}
              className="flex h-9 items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3.5 text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Database className="h-3.5 w-3.5" />
              )}
              <span>{syncing ? 'Syncing to DB...' : 'Sync Live to Database'}</span>
            </button>
          </div>
        </div>

        {/* Connected Platforms Pills */}
        <div className="mt-3.5 pt-3 border-t border-emerald-100/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Connected Channels:
          </span>

          {connectedPlatforms.length > 0 ? (
            connectedPlatforms.map((plat) => (
              <div
                key={plat}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow-2xs"
              >
                <PlatformIcon platform={plat} size={16} />
                <span>{plat}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
            ))
          ) : (
            <span className="text-amber-700 font-semibold text-xs">
              No accounts currently connected.
            </span>
          )}

          {connectedPlatforms.some((p) => p.toLowerCase() === 'youtube') && (
            <Link
              to="/dashboard?source=live&platform=YouTube"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 px-2.5 py-1 text-xs font-bold transition-colors shadow-2xs"
              title="Open YouTube Live Analytics on Dashboard"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              <span>YouTube Live Telemetry</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}

          <Link
            to="/social-connections"
            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            <span>Manage Connections</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Sync feedback notification */}
        {syncFeedback && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100/80 text-rose-800 border border-rose-300'
            }`}
          >
            {syncFeedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{syncFeedback.message}</span>
          </div>
        )}
      </div>

      {/* Disconnected Platform Warning (if current filter is not connected) */}
      {!isSelectedConnected && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <PlatformIcon platform={selectedPlatform} size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                {selectedPlatform} is not connected
              </h4>
              <p className="text-[11px] text-amber-800">
                Live streaming metrics are unavailable for {selectedPlatform} until it is connected in Connected Apps.
              </p>
            </div>
          </div>

          <Link
            to="/social-connections"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 text-xs font-bold transition-colors shadow-2xs"
          >
            <span>Connect {selectedPlatform}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
