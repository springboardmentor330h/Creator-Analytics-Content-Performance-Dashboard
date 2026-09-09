import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RefreshCw,
  ExternalLink,
  Users,
  Eye,
  Video,
  ThumbsUp,
  MessageSquare,
  Zap,
  CheckCircle2,
  AlertCircle,
  Database,
  Radio,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import PlatformIcon from '../PlatformIcon'
import { socialService, YouTubeLiveAnalyticsData } from '../../services/socialService'
import { formatNumber, formatPercent } from '../../utils/format'

interface YouTubeLiveDashboardSectionProps {
  onSyncComplete?: () => void
  onBackToOverview?: () => void
}

export default function YouTubeLiveDashboardSection({
  onSyncComplete,
  onBackToOverview,
}: YouTubeLiveDashboardSectionProps) {
  const [data, setData] = useState<YouTubeLiveAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null)

  const fetchLiveAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)
    setError(null)
    setSyncSuccess(null)

    try {
      const result = await socialService.getYoutubeLiveAnalytics()
      setData(result)
    } catch (err: any) {
      const status = err?.response?.status
      const detail = err?.response?.data?.detail || err?.message || 'Failed to fetch live YouTube analytics'
      if (status === 404) {
        setError('not_connected')
      } else if (status === 401) {
        setError('expired')
      } else {
        setError(detail)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLiveAnalytics()
  }, [])

  const handleSyncToDatabase = async () => {
    try {
      setSyncing(true)
      setSyncSuccess(null)
      const res = await socialService.sync('youtube')
      setSyncSuccess(`Successfully synchronized ${res.records_synced || 0} YouTube videos to database!`)
      if (onSyncComplete) onSyncComplete()
      fetchLiveAnalytics(true)
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to sync to database'
      setError(detail)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-4">
        <div className="relative mx-auto w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <PlatformIcon platform="youtube" size={18} variant="solid" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Connecting to YouTube Data API v3...</h3>
          <p className="text-xs text-slate-400 mt-1">Retrieving live telemetry from connected channel</p>
        </div>
      </div>
    )
  }

  if (error === 'not_connected') {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xs text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-200 text-red-600">
          <PlatformIcon platform="youtube" size={32} variant="solid" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
            <Radio className="w-3 h-3 animate-pulse text-amber-600" />
            YouTube Not Connected
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Connect YouTube for Live Analytics</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Link your YouTube account in Connected Apps to stream live subscriber counts, lifetime views, and recent upload performance right here on the dashboard.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/social-connections"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-xs transition-all"
          >
            <PlatformIcon platform="youtube" size={16} variant="solid" />
            <span>Connect YouTube in Connected Apps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {onBackToOverview && (
            <button
              type="button"
              onClick={onBackToOverview}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  if (error === 'expired') {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-8 text-center space-y-4 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-rose-950">YouTube Connection Expired</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto mt-1">
            Your Google OAuth access session expired. Please reconnect your account to continue streaming live telemetry.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Link
            to="/social-connections"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <span>Reconnect YouTube</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {onBackToOverview && (
            <button
              type="button"
              onClick={onBackToOverview}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  const channel = data?.channel
  const metrics = data?.metrics
  const recentVideos = data?.recent_videos || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header Bar with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 border border-red-200 text-red-600 shadow-2xs">
            <PlatformIcon platform="youtube" size={24} variant="solid" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                YouTube Live Analytics
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                LIVE YOUTUBE API
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time channel telemetry direct from YouTube Data API v3
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onBackToOverview && (
            <button
              type="button"
              onClick={onBackToOverview}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchLiveAnalytics(true)}
            disabled={refreshing || syncing}
            title="Refresh live telemetry directly from YouTube"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
            <span>{refreshing ? 'Fetching...' : 'Refresh Live Data'}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncToDatabase}
            disabled={syncing || refreshing}
            title="Synchronize live records into database"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all shadow-2xs disabled:opacity-50"
          >
            <Database className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-blue-600' : 'text-blue-600'}`} />
            <span>{syncing ? 'Syncing to DB...' : 'Sync to Database'}</span>
          </button>
        </div>
      </div>

      {/* Sync Success / Error Alert */}
      {syncSuccess && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncSuccess}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Channel Live Telemetry Banner (High Contrast & Red Gradient) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 sm:p-8 text-white shadow-md border border-red-500">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Channel Details */}
          <div className="flex items-center gap-4 sm:gap-5">
            {channel?.thumbnail_url ? (
              <img
                src={channel.thumbnail_url}
                alt={channel.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/50 shadow-md shrink-0 bg-white"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/40 text-2xl font-black shrink-0">
                {channel?.title?.charAt(0) || 'Y'}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-red-700 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  Live YouTube API
                </span>
                {channel?.profile_url && (
                  <a
                    href={channel.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-100 hover:text-white transition-colors"
                  >
                    <span>View Channel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {channel?.title || 'Connected YouTube Channel'}
              </h2>
              <p className="text-xs text-red-100 font-semibold mt-0.5">
                {channel?.custom_url || `@${channel?.channel_id}`}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-red-100/90 font-medium">
                <span>
                  Channel ID: <code className="bg-black/25 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">{channel?.channel_id}</code>
                </span>
                {data?.fetched_at && (
                  <span>Refreshed: {new Date(data.fetched_at).toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Metrics Badges on Banner */}
          <div className="flex items-center gap-5 sm:gap-7 bg-black/25 backdrop-blur-sm rounded-2xl px-5 py-3.5 border border-white/15 self-stretch md:self-auto justify-around">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-red-200 font-extrabold">Subscribers</p>
              <p className="text-lg sm:text-xl font-black text-white mt-0.5">{formatNumber(channel?.subscribers ?? 0)}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-red-200 font-extrabold">Total Views</p>
              <p className="text-lg sm:text-xl font-black text-white mt-0.5">{formatNumber(channel?.total_views ?? 0)}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-red-200 font-extrabold">Videos</p>
              <p className="text-lg sm:text-xl font-black text-white mt-0.5">{channel?.video_count ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Banner Bottom Status Bar */}
        <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-red-100 font-medium text-[11px]">
            Live streaming channel telemetry direct from YouTube Data API v3 • Real-time OAuth session
          </span>
          <div className="flex items-center gap-2 text-[11px] text-red-100/90 font-semibold">
            <span>Mode: {data?.connection_mode || 'OAuth Live'}</span>
          </div>
        </div>
      </div>

      {/* 3. 4 Core Telemetry Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs min-w-0 overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Subscribers</span>
              <div className="p-2 rounded-xl bg-red-50 text-red-600 shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate" title={formatNumber(metrics.subscribers)}>
                {formatNumber(metrics.subscribers)}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">Live audience size</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs min-w-0 overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Lifetime Views</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate" title={formatNumber(metrics.total_views)}>
                {formatNumber(metrics.total_views)}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">Total channel view count</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs min-w-0 overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Public Videos</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate" title={String(metrics.video_count)}>
                {metrics.video_count}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">Uploaded public videos</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs min-w-0 overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Engagement Rate</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate" title={formatPercent(metrics.average_engagement_rate)}>
                {formatPercent(metrics.average_engagement_rate)}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                Across recent {recentVideos.length} uploads
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Recent Uploaded Videos Telemetry */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Videos Telemetry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time views, likes, comments, and engagement rates from YouTube Data API v3
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {recentVideos.length} videos
          </span>
        </div>

        {recentVideos.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No recent uploaded videos found for this channel.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Video</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-4 text-right">Views</th>
                  <th className="py-3 px-4 text-right">Likes</th>
                  <th className="py-3 px-4 text-right">Comments</th>
                  <th className="py-3 px-4 text-right">Engagement</th>
                  <th className="py-3 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {recentVideos.map((vid) => (
                  <tr key={vid.video_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 max-w-xs sm:max-w-sm">
                      <div className="flex items-center gap-3">
                        {vid.thumbnail_url ? (
                          <img
                            src={vid.thumbnail_url}
                            alt={vid.title}
                            className="w-14 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Video className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate text-xs" title={vid.title}>
                            {vid.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {vid.video_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-nowrap text-[11px]">
                      {vid.published_at ? new Date(vid.published_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {formatNumber(vid.views)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-slate-400" />
                        {formatNumber(vid.likes)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-400" />
                        {formatNumber(vid.comments)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {formatPercent(vid.engagement_rate)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <a
                        href={vid.video_url || `https://www.youtube.com/watch?v=${vid.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors"
                      >
                        <span>Watch</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
