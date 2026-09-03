import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  Eye,
  MessageSquare,
  Share2,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { analyticsApi } from '../services/api'
import { formatNumber, formatPercent } from '../utils/format'
import PlatformIcon from '../components/PlatformIcon'

const PIE_COLORS = ['#ef4444', '#e1306c', '#0a66c2', '#1877f2', '#0f172a', '#06b6d4', '#8b5cf6']

const PLATFORM_COLORS: Record<string, string> = {
  YouTube: '#ef4444',
  Instagram: '#e1306c',
  Facebook: '#1877f2',
  LinkedIn: '#0a66c2',
  X: '#0f172a',
  Twitter: '#0f172a',
  TikTok: '#06b6d4',
}

const PLATFORM_BADGES: Record<string, string> = {
  YouTube: 'bg-red-50 text-red-700 border-red-200',
  Instagram: 'bg-pink-50 text-pink-700 border-pink-200',
  TikTok: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Facebook: 'bg-blue-50 text-blue-700 border-blue-200',
  X: 'bg-slate-100 text-slate-800 border-slate-200',
  LinkedIn: 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

interface DashboardSummary {
  total_views: number
  total_likes: number
  total_comments: number
  total_shares: number
  total_reach: number
  total_followers: number
  average_engagement_rate: number
}

interface ChartResponse {
  labels: string[]
  values: number[]
}

interface PlatformMetric {
  views: number
  reach: number
  engagement_rate: number
  likes?: number
  comments?: number
}

interface TopContentItem {
  content_title: string
  platform: string
  views: number
  reach: number
  watch_time?: number
  engagement_rate: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [engagementTrend, setEngagementTrend] = useState<{ date: string; value: number }[]>([])
  const [followersTrend, setFollowersTrend] = useState<{ date: string; value: number }[]>([])
  const [activeChartTab, setActiveChartTab] = useState<'engagement' | 'followers'>('engagement')
  const [platformMetricTab, setPlatformMetricTab] = useState<'views' | 'reach' | 'engagement_rate'>('reach')
  const [platformData, setPlatformData] = useState<{ name: string; views: number; reach: number; engagement_rate: number }[]>([])
  const [topContent, setTopContent] = useState<TopContentItem[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const loadDashboardData = async () => {
      setLoading(true)
      setError('')
      try {
        const platformParam = selectedPlatform === 'All' ? undefined : selectedPlatform
        const [summaryRes, engChartRes, folChartRes, platformRes, topContentRes] = await Promise.all([
          analyticsApi.summary(platformParam),
          analyticsApi.engagementChart(platformParam),
          analyticsApi.followersChart(),
          analyticsApi.platformComparison(),
          analyticsApi.topContent(platformParam),
        ])

        if (!isMounted) return

        // 1. Summary KPIs
        setSummary(summaryRes.data)

        // 2. Engagement Trend Chart
        const engData: ChartResponse = engChartRes.data || { labels: [], values: [] }
        const mappedEng = (engData.labels || []).map((date, idx) => ({
          date,
          value: engData.values?.[idx] ?? 0,
        }))
        setEngagementTrend(mappedEng)

        // 3. Followers Growth Chart
        const folData: ChartResponse = folChartRes.data || { labels: [], values: [] }
        const mappedFol = (folData.labels || []).map((date, idx) => ({
          date,
          value: folData.values?.[idx] ?? 0,
        }))
        setFollowersTrend(mappedFol)

        // 4. Platform Comparison Distribution
        const rawPlatforms: Record<string, PlatformMetric> = platformRes.data || {}
        const mappedPlatforms = Object.entries(rawPlatforms).map(([name, data]) => ({
          name,
          views: data.views ?? 0,
          reach: data.reach ?? 0,
          engagement_rate: data.engagement_rate ?? 0,
        }))
        setPlatformData(mappedPlatforms)

        // 5. Top Content
        setTopContent(Array.isArray(topContentRes.data) ? topContentRes.data : [])
      } catch (err: unknown) {
        if (!isMounted) return
        setError('Unable to load analytics data. Please refresh or verify your connection.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDashboardData()
    return () => {
      isMounted = false
    }
  }, [selectedPlatform])

  const cards = summary
    ? [
        { label: 'Total Views', value: formatNumber(summary.total_views), icon: Eye, change: '+14.2%', color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Total Likes', value: formatNumber(summary.total_likes), icon: ThumbsUp, change: '+8.7%', color: 'text-blue-600 bg-blue-50' },
        { label: 'Total Comments', value: formatNumber(summary.total_comments), icon: MessageSquare, change: '+12.1%', color: 'text-amber-600 bg-amber-50' },
        { label: 'Total Shares', value: formatNumber(summary.total_shares), icon: Share2, change: '+5.4%', color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Total Reach', value: formatNumber(summary.total_reach), icon: Users, change: '+18.6%', color: 'text-cyan-600 bg-cyan-50' },
        { label: 'Total Followers', value: formatNumber(summary.total_followers), icon: UserCheck, change: '+10.5%', color: 'text-purple-600 bg-purple-50' },
        { label: 'Average Engagement Rate', value: formatPercent(summary.average_engagement_rate), icon: Zap, change: '+3.2%', color: 'text-rose-600 bg-rose-50' },
      ]
    : []

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-card">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-bold text-slate-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        <h3 className="text-base font-bold">Unable to load analytics data</h3>
        <p className="mt-1 text-xs">{error}</p>
      </div>
    )
  }

  const currentTrendData = activeChartTab === 'engagement' ? engagementTrend : followersTrend
  const currentTrendUnit = activeChartTab === 'engagement' ? '%' : ''

  // Chart data for Platform Distribution depending on selected metric
  const currentPieData = platformData.map((p) => ({
    name: p.name,
    value: platformMetricTab === 'views' ? p.views : platformMetricTab === 'reach' ? p.reach : p.engagement_rate,
    views: p.views,
    reach: p.reach,
    engagement_rate: p.engagement_rate,
  }))

  const getPlatformColor = (name: string, index: number) => {
    return PLATFORM_COLORS[name] || PIE_COLORS[index % PIE_COLORS.length]
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            Multi-Platform Analytics Suite
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Overview</h2>
          <p className="mt-1 text-sm text-slate-500">
            Active Scope: <span className="font-bold text-slate-700">{user?.role || 'Creator'}</span> · PostgreSQL live metrics ingestion.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Platform:</span>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-transparent text-sm font-extrabold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Platforms</option>
              <option value="YouTube">YouTube</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>
          </div>
          <Link to="/content-analytics" className="ciq-btn-primary">
            <BarChart3 className="h-4 w-4" />
            <span>Content Analytics</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid - All 7 metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <p className="text-2xl lg:text-3xl font-extrabold text-slate-900">{card.value}</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Performance Trends</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {activeChartTab === 'engagement' ? 'Engagement rate progression across published content' : 'Follower growth trajectory over time'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
                <button
                  onClick={() => setActiveChartTab('engagement')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    activeChartTab === 'engagement' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Engagement Rate
                </button>
                <button
                  onClick={() => setActiveChartTab('followers')}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    activeChartTab === 'followers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Followers
                </button>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 hidden sm:inline-block">
                System Sync
              </span>
            </div>
          </div>

          <div className="mt-6 h-80">
            {currentTrendData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                No trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit={currentTrendUnit} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      color: '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08)',
                    }}
                    formatter={(val: number) => [`${formatNumber(val)}${currentTrendUnit}`, activeChartTab === 'engagement' ? 'Engagement Rate' : 'Followers']}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fill="url(#trendFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Platform Mix Donut Chart */}
        <div className="ciq-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Platform Distribution</h3>
                <p className="text-[11px] text-slate-500">Cross-channel audience distribution</p>
              </div>
              <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/60 text-[10px] font-bold">
                <button
                  onClick={() => setPlatformMetricTab('reach')}
                  className={`rounded px-2 py-0.5 transition-all ${
                    platformMetricTab === 'reach' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Reach
                </button>
                <button
                  onClick={() => setPlatformMetricTab('views')}
                  className={`rounded px-2 py-0.5 transition-all ${
                    platformMetricTab === 'views' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Views
                </button>
                <button
                  onClick={() => setPlatformMetricTab('engagement_rate')}
                  className={`rounded px-2 py-0.5 transition-all ${
                    platformMetricTab === 'engagement_rate' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Rate
                </button>
              </div>
            </div>

            <div className="mt-4 h-56">
              {currentPieData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                  No platform distribution data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={3}
                      minAngle={15}
                    >
                      {currentPieData.map((entry, index) => (
                        <Cell key={entry.name} fill={getPlatformColor(entry.name, index)} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        color: '#0f172a',
                        fontSize: '12px',
                      }}
                      formatter={(_val: number, _name: string, props: any) => {
                        const p = props.payload
                        if (platformMetricTab === 'views') {
                          return [`${formatNumber(p.views)} views`, p.name]
                        }
                        if (platformMetricTab === 'reach') {
                          return [`${formatNumber(p.reach)} reach`, p.name]
                        }
                        return [`${formatPercent(p.engagement_rate)}`, p.name]
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Dynamic Legend with percentages & values */}
          <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
            {platformData.map((entry, index) => {
              const displayVal =
                platformMetricTab === 'views'
                  ? `${formatNumber(entry.views)}`
                  : platformMetricTab === 'reach'
                  ? `${formatNumber(entry.reach)} reach`
                  : `${formatPercent(entry.engagement_rate)}`

              return (
                <div
                  key={entry.name}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: getPlatformColor(entry.name, index) }}
                    />
                    <span className="text-xs font-bold text-slate-700 truncate">{entry.name}</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-500 shrink-0 ml-1">{displayVal}</span>
                </div>
              )
            })}
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
                <th className="py-3 px-3">Reach</th>
                <th className="py-3 px-3">Engagement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topContent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No top content found.
                  </td>
                </tr>
              ) : (
                topContent.map((item, idx) => (
                  <tr key={idx} className="group transition-colors hover:bg-slate-50/80">
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      <span>{item.content_title}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={item.platform} size={20} />
                        <span className="text-xs font-semibold text-slate-600">{item.platform}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">{formatNumber(item.views)}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">{formatNumber(item.reach)}</td>
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
