import { useState, useEffect } from 'react'
import { audienceApi } from '../services/api'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Users, Minus } from 'lucide-react'

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

  useEffect(() => {
    Promise.all([audienceApi.growth(), audienceApi.trends()])
      .then(([g, t]) => {
        setGrowthData(g.data)
        setTrendData(t.data)
      })
      .catch(() => setError('Failed to load growth analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  )
  if (error) return <div className="bg-red-50 text-red-600 rounded-xl p-4 border border-red-200">{error}</div>

  const latest = growthData[growthData.length - 1]
  const first = growthData[0]
  const totalGrowth = latest && first ? latest.followers - first.followers : 0
  const growthPct = latest?.growth_percentage ?? 0
  const isUp = totalGrowth >= 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Growth & Trends</h2>
        <p className="text-sm text-slate-500 mt-1">Follower growth and audience reach trends over time</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Current Followers</p>
            <p className="text-2xl font-extrabold text-slate-900">{latest?.followers?.toLocaleString() ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isUp ? 'bg-emerald-600' : 'bg-red-500'}`}>
            {isUp ? <TrendingUp className="h-6 w-6 text-white" /> : <TrendingDown className="h-6 w-6 text-white" />}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Growth</p>
            <p className={`text-2xl font-extrabold ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
              {isUp ? '+' : ''}{totalGrowth.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500">
            <Minus className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Last Growth %</p>
            <p className="text-2xl font-extrabold text-slate-900">{growthPct.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      {/* Follower Growth Line Chart */}
      {growthData.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Follower Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="followersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="followers" stroke="#6366f1" strokeWidth={2} fill="url(#followersGrad)" name="Followers" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 shadow-sm">
          No growth data available yet.
        </div>
      )}

      {/* Daily Growth Bar + Reach trend */}
      {trendData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Followers vs Reach Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="followers" stroke="#6366f1" strokeWidth={2} dot={false} name="Followers" />
              <Line type="monotone" dataKey="reach" stroke="#10b981" strokeWidth={2} dot={false} name="Reach" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
