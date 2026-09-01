import { useEffect, useState } from 'react'
import { audienceAPI } from '../services/api'
import KPICard from '../components/ui/KPICard'
import Loading from '../components/ui/Loading'
import ErrorBox from '../components/ui/ErrorBox'
import { Donut, SimpleBar } from '../components/charts/SimpleCharts'

function toChart(obj) {
  if (!obj || typeof obj !== 'object') return []
  if (Array.isArray(obj)) {
    return obj.map((x) => ({
      name: x.country || x.city || x.device_type || x.name || '—',
      value: x.count || x.value || 0,
    }))
  }
  return Object.entries(obj).map(([name, value]) => ({ name, value: Number(value) || 0 }))
}

export default function Audience() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    audienceAPI.report()
      .then((res) => setData(res.data))
      .catch((e) => setError(e.response?.data?.detail || e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audience Analytics</h1>
      {error && <ErrorBox message={String(error)} />}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KPICard title="Followers" value={data?.total_followers} />
        <KPICard title="Reach" value={data?.total_reach} />
        <KPICard title="Impressions" value={data?.total_impressions} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="text-sm mb-3">Gender</h2>
          <Donut data={toChart(data?.gender_distribution)} />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="text-sm mb-3">Age</h2>
          <SimpleBar data={toChart(data?.age_distribution)} />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="text-sm mb-3">Top Countries</h2>
          <SimpleBar data={toChart(data?.top_countries || data?.top_country)} color="#8b5cf6" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="text-sm mb-3">Devices</h2>
          <Donut data={toChart(data?.device_usage)} />
        </div>
      </div>
    </div>
  )
}
