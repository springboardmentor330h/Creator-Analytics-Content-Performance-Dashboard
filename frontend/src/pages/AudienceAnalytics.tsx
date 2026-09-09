import { useState, useEffect } from 'react'
import { audienceApi } from '../services/api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Users, Globe, Smartphone, TrendingUp, MapPin, RefreshCw, Layers } from 'lucide-react'
import {
  KPICard,
  ChartCard,
  DataTable,
  KPISkeleton,
  ChartSkeleton,
  ErrorState,
} from '../components/ui'
import { formatNumber } from '../utils/format'

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

const GENDER_COLORS = ['#4f46e5', '#ec4899', '#06b6d4', '#94a3b8']
const DEVICE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6']

export default function AudienceAnalytics() {
  const [data, setData] = useState<AudienceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = () => {
    setLoading(true)
    setError('')
    audienceApi
      .analytics()
      .then((r) => setData(r.data))
      .catch(() => setError('Failed to load audience analytics. Please retry.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const genderData = data
    ? Object.entries(data.gender_distribution || {}).map(([name, value]) => ({
        name,
        value: Number(value.toFixed(1)),
      }))
    : []

  const ageData = data
    ? Object.entries(data.age_distribution || {}).map(([name, value]) => ({
        name,
        value: Number(value.toFixed(1)),
      }))
    : []

  const deviceData = data
    ? Object.entries(data.device_distribution || {}).map(([name, value]) => ({
        name,
        value: Number(value.toFixed(1)),
      }))
    : []

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Audience Analytics
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Demographic breakdowns, device ecosystems, and geographic density from connected platforms.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          title="Refresh audience metrics"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={loadData} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <KPISkeleton key={i} />)
        ) : (
          <>
            <KPICard
              title="Total Followers"
              value={formatNumber(data?.total_followers ?? 0)}
              icon={Users}
              color="indigo"
              change={8.4}
              changeLabel="network aggregate"
            />
            <KPICard
              title="Total Reach"
              value={formatNumber(data?.total_reach ?? 0)}
              icon={Globe}
              color="emerald"
              change={14.1}
              changeLabel="unique accounts"
            />
            <KPICard
              title="Impressions"
              value={formatNumber(data?.total_impressions ?? 0)}
              icon={TrendingUp}
              color="amber"
              change={11.7}
              changeLabel="content views"
            />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution Donut */}
        <ChartCard
          title="Gender Distribution"
          subtitle="Demographic share percentage across active followers"
          loading={loading}
          empty={genderData.length === 0}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 h-64 sm:h-72 w-full pt-2">
            <div className="h-full w-full sm:w-1/2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {genderData.map((_, index) => (
                      <Cell key={`gender-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                    formatter={(val: number) => [`${val}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:w-1/2 flex flex-col justify-center space-y-2.5 text-xs">
              {genderData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GENDER_COLORS[idx % GENDER_COLORS.length] }} />
                    <span className="font-bold text-slate-800">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Age Distribution Bar Chart */}
        <ChartCard
          title="Age Demographics"
          subtitle="Audience distribution by demographic cohorts"
          loading={loading}
          empty={ageData.length === 0}
        >
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  formatter={(v: number) => [`${v}%`, 'Audience Share']}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Device Ecosystem & Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Distribution */}
        <div className="ciq-card flex flex-col">
          <div className="ciq-card-header">
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900">Device Ecosystem</h3>
              <p className="text-xs text-slate-500 mt-0.5">Hardware access platforms</p>
            </div>
            <Smartphone className="h-4 w-4 text-indigo-600" />
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {deviceData.map((d, i) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 capitalize">{d.name}</span>
                  <span className="font-extrabold text-slate-900">{d.value}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${d.value}%`,
                      backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="ciq-card">
          <div className="ciq-card-header">
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900">Top Countries</h3>
              <p className="text-xs text-slate-500 mt-0.5">Highest audience concentration</p>
            </div>
            <Globe className="h-4 w-4 text-emerald-600" />
          </div>

          <div className="space-y-2 text-xs">
            {(data?.top_countries || []).map((country, idx) => (
              <div
                key={country}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800">{country}</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600">High Density</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div className="ciq-card">
          <div className="ciq-card-header">
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900">Top Metros & Cities</h3>
              <p className="text-xs text-slate-500 mt-0.5">Urban subscriber clusters</p>
            </div>
            <MapPin className="h-4 w-4 text-amber-600" />
          </div>

          <div className="space-y-2 text-xs">
            {(data?.top_cities || []).map((city, idx) => (
              <div
                key={city}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800">{city}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
