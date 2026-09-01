import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsAPI } from '../services/api'
import KPICard from '../components/ui/KPICard'
import Loading from '../components/ui/Loading'
import ErrorBox from '../components/ui/ErrorBox'
import { AreaTrend, SimpleBar } from '../components/charts/SimpleCharts'

function chartFromLabelsValues(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  const labels = payload.labels || []
  const values = payload.values || []
  return labels.map((label, i) => ({ date: String(label), value: Number(values[i]) || 0 }))
}

function num(v) {
  if (v === null || v === undefined) return null
  if (typeof v === 'object') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function normalizePlatformRows(data) {
  if (!data) return []
  if (Array.isArray(data)) {
    return data.map((x) => ({
      platform: x.platform || x.name || '—',
      views: num(x.total_views ?? x.views) || 0,
      likes: num(x.total_likes ?? x.likes) || 0,
      comments: num(x.total_comments ?? x.comments) || 0,
      reach: num(x.total_reach ?? x.reach) || 0,
      avgEngagement: num(x.average_engagement_rate ?? x.engagement_rate) || 0,
      contentCount: num(x.content_count ?? x.count) || 0,
    }))
  }
  if (typeof data === 'object') {
    return Object.entries(data).map(([name, v]) => {
      if (v && typeof v === 'object') {
        return {
          platform: name,
          views: num(v.total_views ?? v.views) || 0,
          likes: num(v.total_likes ?? v.likes) || 0,
          comments: num(v.total_comments ?? v.comments) || 0,
          reach: num(v.total_reach ?? v.reach) || 0,
          avgEngagement: num(v.average_engagement_rate ?? v.engagement_rate) || 0,
          contentCount: num(v.content_count) || 0,
        }
      }
      return { platform: name, views: num(v) || 0, likes: 0, comments: 0, reach: 0, avgEngagement: 0, contentCount: 0 }
    })
  }
  return []
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [top, setTop] = useState([])
  const [platformRows, setPlatformRows] = useState([])
  const [engChart, setEngChart] = useState([])
  const [folChart, setFolChart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.allSettled([
      analyticsAPI.summary(),
      analyticsAPI.topContent(),
      analyticsAPI.platformPerformance().catch(() => analyticsAPI.platformComparison()),
      analyticsAPI.engagementChart(),
      analyticsAPI.followersChart(),
    ]).then((results) => {
      const [s, t, p, e, f] = results
      if (s.status === 'fulfilled') setSummary(s.value.data)
      else setError('Unable to load dashboard summary')
      if (t.status === 'fulfilled') setTop(Array.isArray(t.value.data) ? t.value.data : [])
      if (p.status === 'fulfilled') setPlatformRows(normalizePlatformRows(p.value.data))
      if (e.status === 'fulfilled') setEngChart(chartFromLabelsValues(e.value.data))
      if (f.status === 'fulfilled') setFolChart(chartFromLabelsValues(f.value.data))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading label="Loading dashboard..." />

  const barViews = platformRows.map((r) => ({ name: r.platform, value: r.views }))
  const barEng = platformRows.map((r) => ({ name: r.platform, value: r.avgEngagement }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Performance overview across platforms</p>
        </div>
        <Link
          to="/social"
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium shadow-sm"
        >
          Sync platforms
        </Link>
      </div>

      {error && <ErrorBox message={error} />}

      {/* Overall KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Total Views" value={num(summary?.total_views)} accent="sky" />
        <KPICard title="Total Reach" value={num(summary?.total_reach)} accent="violet" />
        <KPICard title="Avg Engagement %" value={num(summary?.average_engagement_rate)} subtitle="All platforms" accent="emerald" />
        <KPICard title="Followers" value={num(summary?.total_followers)} subtitle="Latest growth snapshot" accent="amber" />
        <KPICard title="Likes" value={num(summary?.total_likes)} />
        <KPICard title="Comments" value={num(summary?.total_comments)} />
        <KPICard title="Shares" value={num(summary?.total_shares)} />
        <KPICard title="Content pieces" value={num(summary?.total_content)} />
      </div>

      {/* Per-platform cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">By platform</h2>
          <Link to="/platform-comparison" className="text-xs text-sky-600 hover:underline">Full comparison</Link>
        </div>
        {platformRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No platform data yet. Sync YouTube or Instagram from{' '}
            <Link to="/social" className="text-sky-600 font-medium">Social Sync</Link>.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {platformRows.map((row) => (
              <div key={row.platform} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-slate-900 capitalize">{row.platform}</p>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {row.contentCount || '—'} posts
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[11px] text-slate-500">Avg engagement</p>
                    <p className="font-semibold text-emerald-600">{row.avgEngagement}%</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[11px] text-slate-500">Views</p>
                    <p className="font-semibold text-slate-900">{row.views.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[11px] text-slate-500">Reach</p>
                    <p className="font-semibold text-slate-900">{row.reach.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[11px] text-slate-500">Likes</p>
                    <p className="font-semibold text-slate-900">{row.likes.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-800 mb-3">Follower growth</h2>
          <AreaTrend data={folChart} color="#0ea5e9" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-800 mb-3">Engagement trend</h2>
          <AreaTrend data={engChart} color="#10b981" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-800 mb-3">Views by platform</h2>
          <SimpleBar data={barViews} />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-800 mb-3">Avg engagement % by platform</h2>
          <SimpleBar data={barEng} color="#10b981" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-medium text-slate-800 mb-3">Top content</h2>
        <div className="space-y-2">
          {top.length === 0 && <p className="text-sm text-slate-400">No content yet</p>}
          {top.slice(0, 8).map((c, i) => (
            <div key={c.content_id || c.id || i} className="flex justify-between gap-3 text-sm border-b border-slate-100 pb-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{c.title || c.content_title || 'Untitled'}</p>
                <p className="text-xs text-slate-500 capitalize">{c.platform}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-slate-800">{(num(c.views) || 0).toLocaleString()} views</p>
                <p className="text-xs text-emerald-600">
                  {num(c.engagement_rate) != null ? `${c.engagement_rate}% eng` : '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
