import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  BarChart3,
  Bookmark,
  Eye,
  MessageSquare,
  Share2,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import contentService, { ContentAnalyticsSummary, ContentItem, ContentTrendPoint } from '../services/contentService'
import { formatNumber, formatPercent } from '../utils/format'

const PIE_COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#ec4899', '#3b82f6']

const PLATFORM_BADGES: Record<string, string> = {
  YouTube: 'bg-red-50 text-red-700 border-red-200',
  Instagram: 'bg-pink-50 text-pink-700 border-pink-200',
  TikTok: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Facebook: 'bg-blue-50 text-blue-700 border-blue-200',
  X: 'bg-slate-100 text-slate-800 border-slate-200',
  LinkedIn: 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<ContentAnalyticsSummary | null>(null)
  const [top, setTop] = useState<ContentItem[]>([])
  const [trends, setTrends] = useState<ContentTrendPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [summaryData, topData, trendsData] = await Promise.all([
          contentService.summary(),
          contentService.topPerforming(),
          contentService.trends(),
        ])
        setSummary(summaryData)
        setTop(topData)
        setTrends(trendsData)
      } catch {
        setError('Unable to load dashboard metrics. Please refresh or sign in again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cards = [
    { label: 'Total Views', value: summary?.total_views ?? 0, icon: Eye, change: '+14.2%', color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Total Likes', value: summary?.total_likes ?? 0, icon: ThumbsUp, change: '+8.7%', color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Comments', value: summary?.total_comments ?? 0, icon: MessageSquare, change: '+12.1%', color: 'text-amber-600 bg-amber-50' },
    { label: 'Total Shares', value: summary?.total_shares ?? 0, icon: Share2, change: '+5.4%', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Saves', value: summary?.total_saves ?? 0, icon: Bookmark, change: '+9.3%', color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Reach', value: summary?.total_reach ?? 0, icon: Users, change: '+18.6%', color: 'text-cyan-600 bg-cyan-50' },
  ]

  const platformBreakdown = top.reduce<Record<string, number>>((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + item.views
    return acc
  }, {})
  const pieData = Object.entries(platformBreakdown).map(([name, value]) => ({ name, value }))

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-card">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-bold text-slate-500">Loading analytics intelligence...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        <h3 className="text-base font-bold">Failed to load metrics</h3>
        <p className="mt-1 text-xs">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            Content Performance Suite
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Overview</h2>
          <p className="mt-1 text-sm text-slate-500">
            Active Scope: <span className="font-bold text-slate-700">{user?.role}</span> · Real-time 8-metric analytics tracking.
          </p>
        </div>
        <Link to="/content-analytics" className="ciq-btn-primary self-start sm:self-auto">
          <BarChart3 className="h-4 w-4" />
          <span>Content Analytics</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="ciq-card relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color} shadow-sm transition-transform group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-3xl font-extrabold text-slate-900">{formatNumber(card.value)}</p>
                <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {card.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Performance Area Chart */}
        <div className="ciq-card xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Performance Trends</h3>
              <p className="mt-0.5 text-xs text-slate-500">Views and engagement rate progression over published dates.</p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              System Sync
            </span>
          </div>

          <div className="mt-6 h-80">
            {trends.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400 font-medium">No trend data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08)' }}
                    itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={3} fill="url(#viewsFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Platform Mix Donut Chart */}
        <div className="ciq-card">
          <h3 className="text-lg font-extrabold text-slate-900">Platform Distribution</h3>
          <p className="mt-0.5 text-xs text-slate-500">View breakdown across connected social channels.</p>
          <div className="mt-4 h-64">
            {pieData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400 font-medium">No platform distribution data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Content Table */}
      <div className="ciq-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Top Performing Content</h3>
            <p className="mt-0.5 text-xs text-slate-500">Ranked by engagement rate across permitted channels.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 border border-indigo-100">
            <Zap className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-extrabold text-indigo-900">
              Avg Engagement: {formatPercent(summary?.average_engagement_rate ?? 0)}
            </span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Content Title</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Views</th>
                <th className="py-3 px-3">Likes</th>
                <th className="py-3 px-3">Engagement Rate</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No top content found.
                  </td>
                </tr>
              ) : (
                top.map((item) => (
                  <tr key={item.id} className="group transition-colors hover:bg-slate-50/80">
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      <Link to={`/content/${item.id}`} className="hover:text-indigo-600 flex items-center gap-2">
                        <span>{item.title}</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${PLATFORM_BADGES[item.platform] || 'bg-slate-100 text-slate-700'}`}>
                        {item.platform}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">{formatNumber(item.views)}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">{formatNumber(item.likes)}</td>
                    <td className="py-3.5 px-3 font-extrabold text-indigo-600">
                      <div className="flex items-center gap-2">
                        <span>{formatPercent(item.engagement_rate)}</span>
                        <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full"
                            style={{ width: `${Math.min(100, item.engagement_rate * 5)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to={`/content/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        <span>Details</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
