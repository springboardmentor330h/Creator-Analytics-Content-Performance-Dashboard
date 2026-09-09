import { useState, useEffect } from 'react'
import { audienceApi } from '../services/api'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Users, Zap, RefreshCw, Activity } from 'lucide-react'
import {
  KPICard,
  ChartCard,
  DataTable,
  KPISkeleton,
  ChartSkeleton,
  ErrorState,
} from '../components/ui'
import { formatNumber, formatPercent } from '../utils/format'

interface GrowthPoint {
  date: string
  followers: number
  daily_growth: number
  growth_percentage: number
}

interface TrendPoint {
  date: string
  followers: number
  reach: number
}

export default function GrowthTrends() {
  const [growthData, setGrowthData] = useState<GrowthPoint[]>([])
  const [trendData, setTrendData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = () => {
    setLoading(true)
    setError('')
    Promise.all([audienceApi.growth(), audienceApi.trends()])
      .then(([g, t]) => {
        setGrowthData(g.data || [])
        setTrendData(t.data || [])
      })
      .catch(() => setError('Failed to load growth analytics.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const latest = growthData[growthData.length - 1]
  const first = growthData[0]
  const totalGrowth = latest && first ? latest.followers - first.followers : 0
  const growthPct = latest?.growth_percentage ?? 0
  const isUp = totalGrowth >= 0

  const growthColumns = [
    {
      header: 'Timeline Date',
      accessor: (item: GrowthPoint) => (
        <span className="font-mono text-xs font-semibold text-slate-800">{item.date}</span>
      ),
    },
    {
      header: 'Total Audience',
      accessor: (item: GrowthPoint) => (
        <span className="font-extrabold text-slate-900">{formatNumber(item.followers)}</span>
      ),
    },
    {
      header: 'Daily Velocity',
      accessor: (item: GrowthPoint) => {
        const up = item.daily_growth >= 0
        return (
          <span className={`font-bold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
            {up ? `+${formatNumber(item.daily_growth)}` : formatNumber(item.daily_growth)}
          </span>
        )
      },
    },
    {
      header: 'Growth Rate',
      accessor: (item: GrowthPoint) => {
        const up = item.growth_percentage >= 0
        return (
          <span className={`font-semibold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
            {up ? `+${item.growth_percentage.toFixed(2)}%` : `${item.growth_percentage.toFixed(2)}%`}
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Growth & Trends
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Historical subscriber trajectory, viral velocity, and network audience expansion.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          title="Refresh growth metrics"
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
              title="Current Followers"
              value={formatNumber(latest?.followers ?? 0)}
              icon={Users}
              color="indigo"
              subtitle="active cross-platform base"
            />
            <KPICard
              title="Net Growth"
              value={`${isUp ? '+' : ''}${totalGrowth.toLocaleString()}`}
              icon={isUp ? TrendingUp : TrendingDown}
              color={isUp ? 'emerald' : 'rose'}
              change={growthPct}
              changeLabel="period velocity"
            />
            <KPICard
              title="Daily Rate"
              value={`${growthPct.toFixed(2)}%`}
              icon={Zap}
              color="amber"
              subtitle="24h expansion rate"
            />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follower Trajectory Area Chart */}
        <ChartCard
          title="Follower Growth Velocity"
          subtitle="Cumulative audience development timeline"
          loading={loading}
          empty={growthData.length === 0}
        >
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="followersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  formatter={(v: number) => [v.toLocaleString(), 'Followers']}
                />
                <Area type="monotone" dataKey="followers" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#followersGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Reach vs Followers Multi-Line Chart */}
        <ChartCard
          title="Audience Reach vs Follower Base"
          subtitle="Cross-referencing viral impressions with subscribed followers"
          loading={loading}
          empty={trendData.length === 0}
        >
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="followers" stroke="#4f46e5" strokeWidth={2.5} dot={false} name="Followers" />
                <Line type="monotone" dataKey="reach" stroke="#10b981" strokeWidth={2.5} dot={false} name="Total Reach" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Historical Growth Milestones Table */}
      <div className="ciq-card">
        <div className="ciq-card-header">
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">Historical Growth Points</h3>
            <p className="text-xs text-slate-500 mt-0.5">Recorded timeline snapshots</p>
          </div>
          <Activity className="h-4 w-4 text-slate-400" />
        </div>

        <DataTable
          columns={growthColumns}
          data={growthData.slice().reverse()}
          keyExtractor={(item, idx) => `${item.date}-${idx}`}
          loading={loading}
          emptyMessage="No historical timeline records logged."
        />
      </div>
    </div>
  )
}
