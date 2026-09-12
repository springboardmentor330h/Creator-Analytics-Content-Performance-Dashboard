import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Eye, Heart, MessageCircle, Share2, Users, Percent, Layers, Radio,
} from 'lucide-react'
import { analyticsAPI, contentAPI } from '../services/api'
import KPICard from '../components/ui/KPICard'
import Loading from '../components/ui/Loading'
import ErrorBox from '../components/ui/ErrorBox'
import { AreaTrend, SimpleBar, Donut } from '../components/charts/SimpleCharts'

const PLATFORM_OPTIONS = [
  'All Platforms',
  'YouTube',
  'Instagram',
  'TikTok',
  'Facebook',
  'LinkedIn',
  'Twitter',
]

function num(v) {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function chartFromLabelsValues(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) {
    if (payload[0]?.date != null || payload[0]?.name != null) return payload
    return payload
  }
  const labels = payload.labels || []
  const values = payload.values || []
  return labels.map((label, i) => ({ date: String(label), value: Number(values[i]) || 0 }))
}

function engagementOf(c) {
  const likes = num(c.likes) || 0
  const comments = num(c.comments) || 0
  const shares = num(c.shares) || 0
  const saves = num(c.saves) || 0
  const den = num(c.reach) || num(c.views) || 0
  if (!den) return 0
  return Math.round(((likes + comments + shares + saves) / den) * 10000) / 100
}

/** Parse content published_date / chart date labels to YYYY-MM-DD or null */
function toDateKey(value) {
  if (value == null || value === '') return null
  if (typeof value === 'string') {
    // ISO or date-only
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/)
    if (m) return m[1]
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
    return null
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  return null
}

function inDateRange(dateKey, from, to) {
  if (!from && !to) return true
  if (!dateKey) return false
  if (from && dateKey < from) return false
  if (to && dateKey > to) return false
  return true
}

export default function Dashboard() {
  const [platform, setPlatform] = useState('All Platforms')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [summary, setSummary] = useState(null)
  const [top, setTop] = useState([])
  const [content, setContent] = useState([])
  const [platformRows, setPlatformRows] = useState([])
  const [engChart, setEngChart] = useState([])
  const [folChart, setFolChart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    Promise.allSettled([
      analyticsAPI.summary(),
      analyticsAPI.topContent(),
      analyticsAPI.platformPerformance().catch(() => analyticsAPI.platformComparison()),
      analyticsAPI.engagementChart(),
      analyticsAPI.followersChart(),
      contentAPI.list(),
    ])
      .then((results) => {
        const [s, t, p, e, f, c] = results
        if (s.status === 'fulfilled') setSummary(s.value.data)
        else if (!silent) setError('Unable to load dashboard summary from API')
        if (t.status === 'fulfilled') setTop(Array.isArray(t.value.data) ? t.value.data : [])
        if (p.status === 'fulfilled') {
          const data = p.value.data
          if (Array.isArray(data)) setPlatformRows(data)
          else if (data && typeof data === 'object') {
            setPlatformRows(
              Object.entries(data).map(([name, v]) =>
                typeof v === 'object' ? { platform: name, ...v } : { platform: name, total_views: v }
              )
            )
          }
        }
        if (e.status === 'fulfilled') setEngChart(chartFromLabelsValues(e.value.data))
        if (f.status === 'fulfilled') setFolChart(chartFromLabelsValues(f.value.data))
        if (c.status === 'fulfilled') {
          const rows = c.value.data
          setContent(Array.isArray(rows) ? rows : rows?.items || [])
        }
      })
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  useEffect(() => {
    load()
  }, [])

  const filteredContent = useMemo(() => {
    return content.filter((c) => {
      if (platform !== 'All Platforms') {
        if (String(c.platform || '').toLowerCase() !== platform.toLowerCase()) return false
      }
      const key = toDateKey(c.published_date || c.published_at || c.date)
      return inDateRange(key, dateFrom || null, dateTo || null)
    })
  }, [content, platform, dateFrom, dateTo])

  const filteredKpis = useMemo(() => {
    const hasDateFilter = Boolean(dateFrom || dateTo)
    // Use API summary only when no platform/date client filters are applied
    if (platform === 'All Platforms' && !hasDateFilter && summary) {
      return {
        views: num(summary.total_views),
        reach: num(summary.total_reach),
        engagement: num(summary.average_engagement_rate),
        followers: num(summary.total_followers),
        likes: num(summary.total_likes),
        comments: num(summary.total_comments),
        shares: num(summary.total_shares),
        pieces: num(summary.total_content),
        best: summary.best_platform,
      }
    }
    const rows = filteredContent
    const views = rows.reduce((a, c) => a + (num(c.views) || 0), 0)
    const likes = rows.reduce((a, c) => a + (num(c.likes) || 0), 0)
    const comments = rows.reduce((a, c) => a + (num(c.comments) || 0), 0)
    const shares = rows.reduce((a, c) => a + (num(c.shares) || 0), 0)
    const reach = rows.reduce((a, c) => a + (num(c.reach) || 0), 0)
    const rates = rows.map(engagementOf).filter((x) => x > 0)
    const engagement = rates.length
      ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100) / 100
      : 0
    return {
      views,
      reach,
      engagement,
      followers: num(summary?.total_followers),
      likes,
      comments,
      shares,
      pieces: rows.length,
      best: platform === 'All Platforms' ? summary?.best_platform : platform,
    }
  }, [filteredContent, platform, summary, dateFrom, dateTo])

  const barViews = useMemo(() => {
    const rows =
      platform === 'All Platforms'
        ? platformRows
        : platformRows.filter(
            (r) => String(r.platform || r.name || '').toLowerCase() === platform.toLowerCase()
          )
    return rows.map((r) => ({
      name: r.platform || r.name,
      value: num(r.total_views ?? r.views) || 0,
    }))
  }, [platformRows, platform])

  const barEng = useMemo(() => {
    const rows =
      platform === 'All Platforms'
        ? platformRows
        : platformRows.filter(
            (r) => String(r.platform || r.name || '').toLowerCase() === platform.toLowerCase()
          )
    return rows.map((r) => ({
      name: r.platform || r.name,
      value: num(r.average_engagement_rate ?? r.engagement_rate) || 0,
    }))
  }, [platformRows, platform])

  const donutViews = useMemo(() => {
    const map = {}
    for (const c of filteredContent) {
      const name = (c.platform || 'Unknown').trim()
      if (!name) continue
      map[name] = (map[name] || 0) + (num(c.views) || 0)
    }
    const fromContent = Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value)
    if (fromContent.length) return fromContent
    return barViews.filter((x) => x.value > 0).map((x) => ({ name: x.name, value: x.value }))
  }, [filteredContent, barViews])

  const topFiltered = useMemo(() => {
    const applyFilters = (c) => {
      if (platform !== 'All Platforms' && String(c.platform || '').toLowerCase() !== platform.toLowerCase()) {
        return false
      }
      const key = toDateKey(c.published_date || c.published_at || c.date)
      // If top-content rows lack dates, keep them when no date filter; otherwise require range match
      if (dateFrom || dateTo) {
        if (key) return inDateRange(key, dateFrom || null, dateTo || null)
        // fall through: prefer filteredContent-derived list when dates missing on top API rows
        return false
      }
      return true
    }
    const list = top.filter(applyFilters)
    if (list.length) return list
    return [...filteredContent]
      .sort((a, b) => (num(b.views) || 0) - (num(a.views) || 0))
      .slice(0, 8)
      .map((c) => ({
        ...c,
        title: c.content_title || c.title,
        engagement_rate: engagementOf(c),
      }))
  }, [top, platform, filteredContent, dateFrom, dateTo])

  const filteredFolChart = useMemo(() => {
    if (!dateFrom && !dateTo) return folChart
    return folChart.filter((row) => inDateRange(toDateKey(row.date || row.name || row.label), dateFrom || null, dateTo || null))
  }, [folChart, dateFrom, dateTo])

  const filteredEngChart = useMemo(() => {
    if (!dateFrom && !dateTo) return engChart
    return engChart.filter((row) => inDateRange(toDateKey(row.date || row.name || row.label), dateFrom || null, dateTo || null))
  }, [engChart, dateFrom, dateTo])

  if (loading) return <Loading label="Loading your analytics…" />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 mb-1 dark:text-sky-400">Overview</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
            Live metrics from PostgreSQL via CreatorIQ APIs
            {refreshing && <span className="ml-2 text-sky-600 dark:text-sky-400">· refreshing…</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Platform</span>
            <select
              className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-transparent outline-none cursor-pointer min-w-[8rem]"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-transparent outline-none cursor-pointer"
              aria-label="Filter from date"
            />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">To</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-transparent outline-none cursor-pointer"
              aria-label="Filter to date"
            />
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => { setDateFrom(''); setDateTo('') }}
                className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                Clear
              </button>
            )}
          </div>
          <button type="button" onClick={() => load(true)} className="ciq-btn-ghost text-sm">
            Refresh
          </button>
          <Link to="/social" className="ciq-btn-primary text-sm">
            Sync platforms
          </Link>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        <KPICard title="Total Views" value={filteredKpis.views} icon={Eye} accent="sky" subtitle={platform} />
        <KPICard title="Total Reach" value={filteredKpis.reach} icon={Radio} accent="violet" />
        <KPICard title="Avg Engagement" value={filteredKpis.engagement} icon={Percent} accent="emerald" subtitle="%" />
        <KPICard title="Followers" value={filteredKpis.followers} icon={Users} accent="amber" subtitle="Growth snapshot" />
        <KPICard title="Likes" value={filteredKpis.likes} icon={Heart} accent="rose" />
        <KPICard title="Comments" value={filteredKpis.comments} icon={MessageCircle} />
        <KPICard title="Shares" value={filteredKpis.shares} icon={Share2} />
        <KPICard title="Content pieces" value={filteredKpis.pieces} icon={Layers} subtitle={filteredKpis.best ? `Best: ${filteredKpis.best}` : undefined} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="ciq-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Follower growth</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Historical growth from API</p>
            </div>
          </div>
          <AreaTrend data={filteredFolChart} color="#0ea5e9" />
        </div>
        <div className="ciq-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Engagement trend</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Engagement over time</p>
            </div>
          </div>
          <AreaTrend data={filteredEngChart} color="#10b981" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="ciq-card p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900 mb-1 dark:text-slate-100">Share of views</h2>
          <p className="text-xs text-slate-500 mb-3 dark:text-slate-400">By platform</p>
          <Donut data={donutViews} />
        </div>
        <div className="ciq-card p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900 mb-1 dark:text-slate-100">Views by platform</h2>
          <p className="text-xs text-slate-500 mb-3 dark:text-slate-400">Comparative volume</p>
          <SimpleBar data={barViews} />
        </div>
        <div className="ciq-card p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900 mb-1 dark:text-slate-100">Avg engagement %</h2>
          <p className="text-xs text-slate-500 mb-3 dark:text-slate-400">Per platform</p>
          <SimpleBar data={barEng} color="#8b5cf6" />
        </div>
      </div>

      {/* Platform cards */}
      {platform === 'All Platforms' && platformRows.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Platform performance</h2>
            <Link to="/platform-comparison" className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400">
              Full comparison →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {platformRows.map((row) => {
              const name = row.platform || row.name || '—'
              const eng = num(row.average_engagement_rate ?? row.engagement_rate) || 0
              const views = num(row.total_views ?? row.views) || 0
              const likes = num(row.total_likes ?? row.likes) || 0
              const reach = num(row.total_reach ?? row.reach) || 0
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setPlatform(name)}
                  className="ciq-card p-4 text-left hover:border-sky-300 hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-slate-900 group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-300">{name}</p>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-950/40">
                      {eng}% eng
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-950">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Views</p>
                      <p className="text-sm font-semibold tabular-nums">{views.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-950">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Likes</p>
                      <p className="text-sm font-semibold tabular-nums">{likes.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-950">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Reach</p>
                      <p className="text-sm font-semibold tabular-nums">{reach.toLocaleString()}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Top content table */}
      <div className="ciq-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Top content {platform !== 'All Platforms' ? `· ${platform}` : ''}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by performance from backend data
              {(dateFrom || dateTo) && (
                <span className="ml-1 text-sky-600 dark:text-sky-400">
                  · {dateFrom || '…'} → {dateTo || '…'}
                </span>
              )}
            </p>
          </div>
          <Link to="/content" className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100 bg-slate-50/80 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Platform</th>
                <th className="px-5 py-3 font-medium text-right">Views</th>
                <th className="px-5 py-3 font-medium text-right">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {topFiltered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 dark:text-slate-500">
                    No content yet. Sync platforms or run the seed script.
                  </td>
                </tr>
              )}
              {topFiltered.slice(0, 8).map((c, i) => (
                <tr key={c.content_id || c.id || i} className="border-b border-slate-50 hover:bg-slate-50/80 transition dark:border-slate-900 dark:hover:bg-slate-950/80">
                  <td className="px-5 py-3 text-slate-400 tabular-nums dark:text-slate-500">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-slate-900 max-w-xs truncate dark:text-slate-100">
                    {c.title || c.content_title || 'Untitled'}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-600 capitalize dark:bg-slate-800 dark:text-slate-400">
                      {c.platform || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-800 dark:text-slate-200">
                    {(num(c.views) || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-emerald-600 font-medium tabular-nums dark:text-emerald-400">
                      {num(c.engagement_rate) != null ? `${c.engagement_rate}%` : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
