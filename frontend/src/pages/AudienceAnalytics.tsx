import { useState, useEffect } from 'react'
import { audienceApi } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import PieChartCard from '../components/PieChartCard'
import { Users, Globe, Smartphone, TrendingUp } from 'lucide-react'

interface AudienceData {
  total_followers: number
  total_reach: number
  total_impressions: number
  gender_distribution: Record<string, number>
  age_distribution: Record<string, number>
  top_countries: string[]
  top_cities: string[]
  device_distribution: Record<string, number>
}

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6']

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
    </div>
  )
}

export default function AudienceAnalytics() {
  const [data, setData] = useState<AudienceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    audienceApi.analytics()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load audience analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  )
  if (error) return <div className="bg-red-50 text-red-600 rounded-xl p-4 border border-red-200">{error}</div>
  if (!data) return <div className="text-slate-500 text-center py-12">No audience data available.</div>

  const genderData = Object.entries(data.gender_distribution).map(([name, value]) => ({ name, value }))
  const ageData = Object.entries(data.age_distribution).map(([name, value]) => ({ name, value: +value.toFixed(1) }))
  const deviceData = Object.entries(data.device_distribution).map(([name, value]) => ({ name, value: +value.toFixed(1) }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Audience Analytics</h2>
        <p className="text-sm text-slate-500 mt-1">Real-time audience insights from your connected platforms</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Followers" value={data.total_followers} icon={Users} color="bg-indigo-600" />
        <StatCard label="Total Reach" value={data.total_reach} icon={Globe} color="bg-emerald-600" />
        <StatCard label="Total Impressions" value={data.total_impressions} icon={TrendingUp} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        {genderData.length > 0 && (
          <PieChartCard
            title="Gender Distribution"
            data={genderData}
            colors={COLORS}
            isPercent
          />
        )}

        {/* Age Distribution */}
        {ageData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Age Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Device Distribution */}
        {deviceData.length > 0 && (
          <PieChartCard
            title="Device Usage"
            data={deviceData}
            colors={COLORS}
            isPercent
          />
        )}

        {/* Top Countries & Cities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Geographic Reach</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Top Countries</p>
              {data.top_countries.slice(0, 5).map((country, i) => (
                <div key={country} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-bold text-indigo-600 w-4">{i + 1}</span>
                  <span className="text-sm text-slate-700">{country}</span>
                </div>
              ))}
              {data.top_countries.length === 0 && <p className="text-xs text-slate-400">No data</p>}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Top Cities</p>
              {data.top_cities.slice(0, 5).map((city, i) => (
                <div key={city} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-bold text-emerald-600 w-4">{i + 1}</span>
                  <span className="text-sm text-slate-700">{city}</span>
                </div>
              ))}
              {data.top_cities.length === 0 && <p className="text-xs text-slate-400">No data</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
