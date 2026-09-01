import { useEffect, useState } from 'react'
import { analyticsAPI } from '../services/api'
import Loading from '../components/ui/Loading'
import ErrorBox from '../components/ui/ErrorBox'
import { GroupedBar, SimpleBar } from '../components/charts/SimpleCharts'

export default function PlatformComparison() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    analyticsAPI.platformPerformance()
      .then((res) => setRows(Array.isArray(res.data) ? res.data : []))
      .catch((e) => setError(e.response?.data?.detail || 'Could not load platform comparison'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const engagementChart = rows.map((r) => ({
    name: r.platform,
    value: r.average_engagement_rate ?? 0,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Platform Comparison</h1>
        <p className="text-sm text-slate-500">
          How your content performs across each connected platform
        </p>
      </div>
      {error && <ErrorBox message={String(error)} />}

      {rows.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          No content synced yet. Connect a platform and sync data to see a comparison here.
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-medium mb-3">Views / Likes / Comments by platform</h2>
              <GroupedBar
                data={rows.map((r) => ({
                  name: r.platform,
                  Views: r.total_views,
                  Likes: r.total_likes,
                  Comments: r.total_comments,
                }))}
                bars={[
                  { key: 'Views', color: '#0ea5e9' },
                  { key: 'Likes', color: '#10b981' },
                  { key: 'Comments', color: '#f59e0b' },
                ]}
              />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-medium mb-3">Average engagement rate by platform</h2>
              <SimpleBar data={engagementChart} color="#8b5cf6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3">Platform</th>
                  <th className="text-right px-4 py-3">Views</th>
                  <th className="text-right px-4 py-3">Likes</th>
                  <th className="text-right px-4 py-3">Comments</th>
                  <th className="text-right px-4 py-3">Shares</th>
                  <th className="text-right px-4 py-3">Reach</th>
                  <th className="text-right px-4 py-3">Avg. Engagement %</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.platform} className="border-b border-slate-200/50">
                    <td className="px-4 py-3 font-medium">{r.platform}</td>
                    <td className="px-4 py-3 text-right">{(r.total_views || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{(r.total_likes || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{(r.total_comments || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{(r.total_shares || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{(r.total_reach || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-emerald-400">{r.average_engagement_rate ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500">
            Follower growth is tracked at the creator level rather than per platform in the
            current data model, so it isn't broken out by platform here — see the{' '}
            <a href="/growth" className="text-sky-600 hover:underline">Growth &amp; Trends</a> page
            for overall follower growth over time.
          </p>
        </>
      )}
    </div>
  )
}
