import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
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
} from 'lucide-react'
import PlatformIcon from '../components/PlatformIcon'
import { socialService, YouTubeLiveAnalyticsData } from '../services/socialService'
import { formatNumber, formatPercent } from '../utils/format'

export default function YouTubeLiveAnalytics() {
  const navigate = useNavigate()
  const [data, setData] = useState<YouTubeLiveAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null)

  const fetchLiveAnalytics = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
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
      setSyncSuccess(`Successfully synchronized ${res.records_synced || 0} videos to database!`)
      // Refresh live view after sync
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <PlatformIcon platform="youtube" size={20} variant="solid" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-sm font-bold text-slate-800">Connecting to YouTube Data API v3...</h3>
          <p className="text-xs text-slate-400 mt-1">Fetching live channel metrics and uploaded videos</p>
        </div>
      </div>
    )
  }

  // Not Connected State
  if (error === 'not_connected') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-sm space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-200 text-red-600">
            <PlatformIcon platform="youtube" size={36} variant="solid" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-3">
              <Radio className="w-3 h-3 animate-pulse" />
              Not Connected
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">YouTube Account Not Connected</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
              Connect your YouTube account in Connected Apps to stream live real-time metrics, subscriber counts, and video engagement directly into CreatorIQ.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/social-connections"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-sm transition-all"
            >
              <PlatformIcon platform="youtube" size={16} variant="solid" />
              <span>Connect YouTube in Connected Apps</span>
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Expired Connection State
  if (error === 'expired') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-sm space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 mb-3">
              Connection Expired
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">YouTube Connection Expired</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
              Your YouTube OAuth session has expired or was revoked. Please reconnect your YouTube account to resume live analytics.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/social-connections"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>Reconnect YouTube</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const channel = data?.channel
  const metrics = data?.metrics
  const recentVideos = data?.recent_videos || []

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/social-connections"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Connected Apps</span>
          </Link>
          <div className="flex items-center gap-3">
            <PlatformIcon platform="youtube" size={32} variant="solid" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">YouTube Live Analytics</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-50 text-red-700 border border-red-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  LIVE YOUTUBE API
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time channel telemetry direct from YouTube Data API v3
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => fetchLiveAnalytics(true)}
            disabled={refreshing || syncing}
            title="Refresh live metrics from YouTube"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
            <span>{refreshing ? 'Fetching Live...' : 'Refresh Live Data'}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncToDatabase}
            disabled={syncing || refreshing}
            title="Persist live records into database"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-2xs disabled:opacity-50"
          >
            <Database className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
            <span>{syncing ? 'Syncing to DB...' : 'Sync to Database'}</span>
          </button>
        </div>
      </div>

      {/* Sync Success Feedback */}
      {syncSuccess && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncSuccess}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Channel Header Banner */}
      {channel && (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-red-600 via-rose-600 to-red-700 p-8 text-white shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {channel.thumbnail_url ? (
                <img
                  src={channel.thumbnail_url}
                  alt={channel.title}
                  className="w-18 h-18 rounded-2xl object-cover border-2 border-white/40 shadow-md"
                />
              ) : (
                <div className="w-18 h-18 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/30 text-2xl font-black">
                  {channel.title?.charAt(0) || 'Y'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black tracking-tight">{channel.title}</h2>
                  {channel.profile_url && (
                    <a
                      href={channel.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-white/80 hover:text-white transition-colors"
                      title="Open channel on YouTube"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-red-100 font-semibold mt-0.5">
                  {channel.custom_url || `@${channel.channel_id}`}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-red-50/90 font-medium">
                  <span>Channel ID: <code className="bg-black/20 px-1.5 py-0.5 rounded text-[11px]">{channel.channel_id}</code></span>
                  {data?.fetched_at && (
                    <span>Last fetched: {new Date(data.fetched_at).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Badge on Banner */}
            <div className="flex items-center gap-6 bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-wider text-red-200 font-bold">Subscribers</p>
                <p className="text-xl font-black mt-0.5">{formatNumber(channel.subscribers)}</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-wider text-red-200 font-bold">Total Views</p>
                <p className="text-xl font-black mt-0.5">{formatNumber(channel.total_views)}</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-wider text-red-200 font-bold">Videos</p>
                <p className="text-xl font-black mt-0.5">{channel.video_count}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Subscribers */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subscribers</span>
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">{formatNumber(metrics.subscribers)}</div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Live audience size</p>
            </div>
          </div>

          {/* Total Channel Views */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifetime Views</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Eye className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">{formatNumber(metrics.total_views)}</div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Total channel view count</p>
            </div>
          </div>

          {/* Uploaded Videos */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Public Videos</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Video className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">{metrics.video_count}</div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Uploaded to channel</p>
            </div>
          </div>

          {/* Recent Engagement Rate */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Engagement Rate</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {formatPercent(metrics.average_engagement_rate)}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Across recent {recentVideos.length} uploaded videos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Uploaded Videos Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Videos Telemetry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live view counts, likes, and comment interactions direct from YouTube
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {recentVideos.length} videos
          </span>
        </div>

        {recentVideos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No recent uploaded videos found for this channel.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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
                    <td className="py-4 px-6 max-w-sm">
                      <div className="flex items-center gap-3">
                        {vid.thumbnail_url ? (
                          <img
                            src={vid.thumbnail_url}
                            alt={vid.title}
                            className="w-16 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Video className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate" title={vid.title}>
                            {vid.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {vid.video_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-nowrap">
                      {vid.published_at ? new Date(vid.published_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">
                      {formatNumber(vid.views)}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-slate-400" />
                        {formatNumber(vid.likes)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-400" />
                        {formatNumber(vid.comments)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {formatPercent(vid.engagement_rate)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
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
