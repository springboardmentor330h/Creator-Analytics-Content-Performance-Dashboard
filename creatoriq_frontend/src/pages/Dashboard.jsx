import { useEffect, useMemo, useState } from 'react'
import { analyticsAPI, contentAPI } from '../services/api'
import KPICard from '../components/ui/KPICard'
import Loading from '../components/ui/Loading'
import ErrorBox from '../components/ui/ErrorBox'
import PlatformSelect from '../components/ui/PlatformSelect'
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

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [content, setContent] = useState([])
  const [top, setTop] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [engChart, setEngChart] = useState([])
  const [folChart, setFolChart] = useState([])
  const [platformFilter, setPlatformFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.allSettled([
      analyticsAPI.summary(),
      analyticsAPI.topContent(),
      analyticsAPI.platformComparison().catch(() => analyticsAPI.platformPerformance()),
      analyticsAPI.engagementChart(),
      analyticsAPI.followersChart(),
      contentAPI.list(),
    ]).then((results) => {
      const [s, t, p, e, f, c] = results
      if (s.status === 'fulfilled') setSummary(s.value.data)
      else setError('Unable to load dashboard summary')
      if (t.status === 'fulfilled') setTop(Array.isArray(t.value.data) ? t.value.data : [])
      if (p.status === 'fulfilled') {
        const data = p.value.data
        if (Array.isArray(data)) {
          setPlatforms(data.map((x) => ({
            name: x.platform || x.name || '—',
            value: num(x.total_views ?? x.views) || 0,
          })))
        } else if (data && typeof data === 'object') {
          setPlatforms(Object.entries(data).map(([name, v]) => ({
            name,
            value: num(typeof v === 'object' ? (v.views ?? v.total_views) : v) || 0,
          })))
        }
      }
      if (e.status === 'fulfilled') setEngChart(chartFromLabelsValues(e.value.data))
      if (f.status === 'fulfilled') setFolChart(chartFromLabelsValues(f.value.data))
      if (c.status === 'fulfilled') setContent(Array.isArray(c.value.data) ? c.value.data : [])
    }).finally(() => setLoading(false))
  }, [])

  const availablePlatforms = useMemo(
    () => Array.from(new Set(content.map((c) => c.platform).filter(Boolean))).sort(),
    [content]
  )

  // KPI cards and "top content" are recomputed client-side from the same
  // /content data already fetched above when a specific platform is chosen,
  // rather than adding a new backend endpoint (per sprint instructions:
  // don't duplicate/add backend logic unnecessarily). Follower/engagement
  // trend charts stay platform-agnostic since growth is tracked per
  // creator, not per platform, in the current data model.
  const isFiltered = platformFilter !== 'All'
  const filteredContent = isFiltered ? content.filter((c) => c.platform === platformFilter) : content

  const filteredKpis = isFiltered
    ? {
        total_views: filteredContent.reduce((a, c) => a + (c.views || 0), 0),
        total_reach: filteredContent.reduce((a, c) => a + (c.reach || 0), 0),
        total_likes: filteredContent.reduce((a, c) => a + (c.likes || 0), 0),
        total_comments: filteredContent.reduce((a, c) => a + (c.comments || 0), 0),
        total_shares: filteredContent.reduce((a, c) => a + (c.shares || 0), 0),
        total_content: filteredContent.length,
      }
    : summary

  const filteredTop = isFiltered
    ? top.filter((c) => c.platform === platformFilter)
    : top

  if (loading) return <Loading label="Loading dashboard..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-400">Overview of your content performance</p>
        </div>
        <PlatformSelect platforms={availablePlatforms} value={platformFilter} onChange={setPlatformFilter} />
      </div>
      {error && <ErrorBox message={error} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Total Views" value={num(filteredKpis?.total_views)} />
        <KPICard title="Total Reach" value={num(filteredKpis?.total_reach)} />
        <KPICard title="Avg Engagement %" value={isFiltered ? null : num(summary?.average_engagement_rate)} />
        <KPICard title="Followers" value={isFiltered ? null : num(summary?.total_followers)} />
        <KPICard title="Likes" value={num(filteredKpis?.total_likes)} />
        <KPICard title="Comments" value={num(filteredKpis?.total_comments)} />
        <KPICard title="Shares" value={num(filteredKpis?.total_shares)} />
        <KPICard title="Content Pieces" value={num(filteredKpis?.total_content)} />
      </div>

      {!isFiltered && (summary?.best_platform || summary?.top_content) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {summary?.best_platform && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-400">Best platform</p>
              <p className="text-lg font-semibold mt-1">{String(summary.best_platform)}</p>
            </div>
          )}
          {summary?.top_content && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-400">Top content</p>
              <p className="text-lg font-semibold mt-1 truncate">{String(summary.top_content)}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-medium mb-3">
            Follower growth {isFiltered && <span className="text-slate-500 font-normal">(all platforms)</span>}
          </h2>
          <AreaTrend data={folChart} color="#0ea5e9" />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-medium mb-3">
            Engagement trend {isFiltered && <span className="text-slate-500 font-normal">(all platforms)</span>}
          </h2>
          <AreaTrend data={engChart} color="#10b981" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-medium mb-3">Views by platform</h2>
          <SimpleBar data={platforms} />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-medium mb-3">
            Top content {isFiltered && <span className="text-slate-500 font-normal">· {platformFilter}</span>}
          </h2>
          <div className="space-y-2 max-h-60 overflow-auto">
            {filteredTop.length === 0 && <p className="text-sm text-slate-500">No content yet</p>}
            {filteredTop.slice(0, 8).map((c, i) => (
              <div key={c.content_id || c.id || i} className="flex justify-between gap-3 text-sm border-b border-slate-800 pb-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.title || c.content_title || 'Untitled'}</p>
                  <p className="text-xs text-slate-500 capitalize">{c.platform}</p>
                </div>
                <div className="text-right shrink-0">
                  <p>{(num(c.views) || 0).toLocaleString()} views</p>
                  <p className="text-xs text-emerald-400">
                    {num(c.engagement_rate) != null ? `${c.engagement_rate}% eng` : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
