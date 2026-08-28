import { useEffect, useState } from 'react'
import { audienceAPI, analyticsAPI } from '../services/api'
import Loading from '../components/ui/Loading'
import ErrorBox from '../components/ui/ErrorBox'
import { AreaTrend } from '../components/charts/SimpleCharts'

export default function Growth() {
  const [growth, setGrowth] = useState([])
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.allSettled([audienceAPI.growth(), analyticsAPI.followersChart(), audienceAPI.trends()])
      .then(([g, f, t]) => {
        if (g.status === 'fulfilled') {
          const rows = Array.isArray(g.value.data) ? g.value.data : []
          setGrowth(rows.map((r) => ({
            date: r.date,
            value: r.followers ?? r.value ?? 0,
            growth: r.daily_growth,
            pct: r.growth_percentage,
          })))
        }
        if (f.status === 'fulfilled') {
          const p = f.value.data
          if (p?.labels) {
            setFollowers(p.labels.map((label, i) => ({ date: label, value: p.values?.[i] ?? 0 })))
          }
        }
        if (g.status === 'rejected' && f.status === 'rejected') {
          setError('Could not load growth data')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />
  const chart = growth.length ? growth : followers

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Growth & Trends</h1>
      {error && <ErrorBox message={error} />}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h2 className="text-sm mb-3">Followers over time</h2>
        <AreaTrend data={chart} height={280} />
      </div>
      {growth.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-right px-4 py-3">Followers</th>
                <th className="text-right px-4 py-3">Daily growth</th>
                <th className="text-right px-4 py-3">%</th>
              </tr>
            </thead>
            <tbody>
              {growth.map((r, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="px-4 py-2">{r.date}</td>
                  <td className="px-4 py-2 text-right">{r.value?.toLocaleString?.() ?? r.value}</td>
                  <td className="px-4 py-2 text-right">{r.growth ?? '—'}</td>
                  <td className="px-4 py-2 text-right">{r.pct ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
