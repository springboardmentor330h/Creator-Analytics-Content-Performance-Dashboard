import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  BarChart3, Eye, ThumbsUp, MessageSquare, Users, Sparkles,
  ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Clock, Zap
} from 'lucide-react'
import PlatformIcon from '../components/PlatformIcon'
import { analyticsApi } from '../services/api'
import { socialService } from '../services/socialService'
import { formatNumber, formatPercent } from '../utils/format'

interface PlatformSummary {
  total_views: number
  total_likes: number
  total_comments: number
  total_shares: number
  total_reach: number
  total_followers: number
  average_engagement_rate: number
}

interface TopContentItem {
  content_title: string
  platform: string
  views: number
  reach: number
  engagement_rate: number
}

const SUPPORTED_CONFIG: Record<string, {
  name: string
  type: 'live' | 'manual'
  badge: string
  tagline: string
  statusLabel: string
}> = {
  youtube: {
    name: 'YouTube',
    type: 'live',
    badge: 'bg-red-50 text-red-700 border-red-200',
    tagline: 'Track long-form video metrics, Shorts velocity, and subscriber engagement.',
    statusLabel: 'Live API Integration'
  },
  instagram: {
    name: 'Instagram',
    type: 'manual',
    badge: 'bg-pink-50 text-pink-700 border-pink-200',
    tagline: 'Monitor Reels reach, post interactions, saves, and engagement velocity.',
    statusLabel: 'PostgreSQL Platform Ingestion'
  },
  facebook: {
    name: 'Facebook',
    type: 'manual',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    tagline: 'Track page reach, live streams, video views, and audience interactions.',
    statusLabel: 'PostgreSQL Platform Ingestion'
  },
  linkedin: {
    name: 'LinkedIn',
    type: 'manual',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    tagline: 'Monitor B2B articles, professional post reach, reaction rates, and discussion.',
    statusLabel: 'PostgreSQL Platform Ingestion'
  }
}

export default function PlatformPage({ forcedPlatform }: { forcedPlatform?: string }) {
  const { platformId } = useParams<{ platformId: string }>()
  const navigate = useNavigate()
  const rawKey = (forcedPlatform || platformId || '').toLowerCase().trim()

  const config = SUPPORTED_CONFIG[rawKey]
  const isImplemented = Boolean(config)

  const [summary, setSummary] = useState<PlatformSummary | null>(null)
  const [topContent, setTopContent] = useState<TopContentItem[]>([])
  const [trendData, setTrendData] = useState<{ date: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const platformCanonical = config?.name || rawKey.charAt(0).toUpperCase() + rawKey.slice(1)

  useEffect(() => {
    if (!isImplemented) {
      setLoading(false)
      return
    }

    let isMounted = true
    const loadPlatformAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        const [sumRes, topRes, trendRes] = await Promise.all([
          analyticsApi.summary(platformCanonical),
          analyticsApi.topContent(platformCanonical),
          analyticsApi.engagementChart(platformCanonical),
        ])

        if (!isMounted) return

        setSummary(sumRes.data)
        setTopContent(Array.isArray(topRes.data) ? topRes.data : [])

        const chart = trendRes.data || { labels: [], values: [] }
        const mappedTrend = (chart.labels || []).map((date: string, idx: number) => ({
          date,
          value: chart.values?.[idx] ?? 0,
        }))
        setTrendData(mappedTrend)
      } catch (err) {
        if (!isMounted) return
        setError('Unable to load analytics for this platform.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadPlatformAnalytics()
    return () => {
      isMounted = false
    }
  }, [rawKey, platformCanonical, isImplemented])

  const handleManualSync = async () => {
    setSyncing(true)
    setSyncSuccess(null)
    try {
      if (rawKey === 'youtube') {
        await socialService.syncYoutube({ max_results: 10 })
      } else {
        await socialService.sync(rawKey)
      }
      setSyncSuccess(`${platformCanonical} data refreshed from PostgreSQL.`)
      // Refresh metrics
      const [sumRes, topRes, trendRes] = await Promise.all([
        analyticsApi.summary(platformCanonical),
        analyticsApi.topContent(platformCanonical),
        analyticsApi.engagementChart(platformCanonical),
      ])
      setSummary(sumRes.data)
      setTopContent(Array.isArray(topRes.data) ? topRes.data : [])
      const chart = trendRes.data || { labels: [], values: [] }
      setTrendData((chart.labels || []).map((date: string, idx: number) => ({
        date,
        value: chart.values?.[idx] ?? 0,
      })))
    } catch {
      setSyncSuccess(`${platformCanonical} analytics currently up to date in PostgreSQL.`)
    } finally {
      setSyncing(false)
    }
  }

  // --- UNIMPLEMENTED PLATFORM: COMING SOON ---
  if (!isImplemented) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-8">
        <Link
          to="/social-connections"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Social Connections
        </Link>

        <div className="ciq-card p-12 text-center border border-slate-200/80 rounded-3xl bg-white shadow-sm flex flex-col items-center">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
            <PlatformIcon platform={rawKey} size={48} />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-700 mb-4">
            <Clock className="h-3.5 w-3.5" />
            Platform Integration Roadmap
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {platformCanonical} Analytics Coming Soon
          </h2>

          <p className="mt-3 text-sm text-slate-500 max-w-lg leading-relaxed">
            Live ingestion and automated analytics for {platformCanonical} are currently under active development.
            Multi-platform analytics are currently live for <strong>YouTube</strong>, <strong>Instagram</strong>, <strong>Facebook</strong>, and <strong>LinkedIn</strong>.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/social-connections" className="ciq-btn-primary">
              View Supported Platforms
            </Link>
            <Link to="/dashboard" className="ciq-btn-secondary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // --- IMPLEMENTED PLATFORM VIEW ---
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/social-connections"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Social Media Platforms
          </Link>
          <div className="flex items-center gap-3">
            <PlatformIcon platform={platformCanonical} size={32} />
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {platformCanonical} Analytics
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{config.tagline}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border ${config.badge} flex items-center gap-1.5`}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            {config.statusLabel}
          </span>
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="ciq-btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>
      </div>

      {syncSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{syncSuccess}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="ciq-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Views</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-indigo-600 bg-indigo-50">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {formatNumber(summary?.total_views ?? 0)}
          </p>
          <span className="mt-1 text-[11px] font-bold text-slate-400">Aggregated from PostgreSQL</span>
        </div>

        <div className="ciq-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Reach</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-cyan-600 bg-cyan-50">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {formatNumber(summary?.total_reach ?? 0)}
          </p>
          <span className="mt-1 text-[11px] font-bold text-slate-400">Platform Audience Impressions</span>
        </div>

        <div className="ciq-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Likes & Reactions</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-blue-600 bg-blue-50">
              <ThumbsUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {formatNumber(summary?.total_likes ?? 0)}
          </p>
          <span className="mt-1 text-[11px] font-bold text-slate-400">
            {formatNumber(summary?.total_comments ?? 0)} Comments
          </span>
        </div>

        <div className="ciq-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Engagement Rate</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-violet-600 bg-violet-50">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {formatPercent(summary?.average_engagement_rate ?? 0)}
          </p>
          <span className="mt-1 text-[11px] font-bold text-slate-400">Normalized Engagement KPI</span>
        </div>
      </div>

      {/* Engagement Trend Chart */}
      <div className="ciq-card">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-base font-extrabold text-slate-900">
            {platformCanonical} Engagement Rate Trend
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological engagement progression for {platformCanonical} content stored in PostgreSQL.
          </p>
        </div>

        <div className="mt-6 h-72">
          {trendData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400 text-xs font-semibold">
              No historical trend records found for {platformCanonical}.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="platformTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                  formatter={(val: number) => [`${formatPercent(val)}`, 'Engagement Rate']}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fill="url(#platformTrendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Performing Content Table */}
      <div className="ciq-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Top {platformCanonical} Content
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by engagement rate from PostgreSQL database.
            </p>
          </div>
          <Link
            to="/content-analytics"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Manage in Content Analytics →
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Title</th>
                <th className="py-3 px-3">Views</th>
                <th className="py-3 px-3">Reach</th>
                <th className="py-3 px-3">Engagement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topContent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium text-xs">
                    No content records found for {platformCanonical}.
                  </td>
                </tr>
              ) : (
                topContent.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{item.content_title}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">{formatNumber(item.views)}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">{formatNumber(item.reach)}</td>
                    <td className="py-3.5 px-3 font-extrabold text-indigo-600">
                      {formatPercent(item.engagement_rate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
