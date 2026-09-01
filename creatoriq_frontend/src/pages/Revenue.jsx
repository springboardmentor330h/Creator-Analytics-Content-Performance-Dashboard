import { useEffect, useState } from 'react'
import { revenueAPI } from '../services/api'
import KPICard from '../components/ui/KPICard'
import Loading from '../components/ui/Loading'
import ErrorBox from '../components/ui/ErrorBox'
import { AreaTrend, Donut } from '../components/charts/SimpleCharts'

export default function Revenue() {
  const [summary, setSummary] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.allSettled([
      revenueAPI.summary(),
      revenueAPI.monthly(),
      revenueAPI.list(),
    ]).then(([s, m, l]) => {
      if (s.status === 'fulfilled') setSummary(s.value.data)
      else setError(s.reason?.response?.data?.detail || 'Failed to load revenue (login required)')
      if (m.status === 'fulfilled') {
        const data = m.value.data
        if (Array.isArray(data)) {
          setMonthly(data.map((x) => ({
            date: x.month || x.date || x.label,
            value: x.total_amount ?? x.value ?? 0,
          })))
        } else if (data?.labels) {
          setMonthly(data.labels.map((label, i) => ({ date: label, value: data.values?.[i] ?? 0 })))
        }
      }
      if (l.status === 'fulfilled') setRows(Array.isArray(l.value.data) ? l.value.data : [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const bySource = (summary?.revenue_by_source || summary?.by_source || []).map((x) => ({
    name: x.source || x.name,
    value: x.total_amount ?? x.value ?? 0,
  }))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Revenue</h1>
      {error && <ErrorBox message={String(error)} />}
      <div className="grid sm:grid-cols-3 gap-3">
        <KPICard title="Total Revenue" value={summary?.total_revenue} />
        <KPICard title="Records" value={summary?.total_records || rows.length} />
        <KPICard title="Sources" value={bySource.length} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="text-sm mb-3">Monthly revenue</h2>
          <AreaTrend data={monthly} color="#10b981" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="text-sm mb-3">By source</h2>
          <Donut data={bySource} />
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-500 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3">Source</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-right px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-200/50">
                <td className="px-4 py-2 capitalize">{r.source}</td>
                <td className="px-4 py-2">{r.date}</td>
                <td className="px-4 py-2 text-right text-emerald-400">${Number(r.amount || 0).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">No revenue records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
