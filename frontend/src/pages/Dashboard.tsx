import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowUpRight,
  BarChart3,
  Database,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  Radio,
  RefreshCw,
  Share2,
  TrendingUp,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { analyticsApi, notificationApi } from '../services/api'
import { socialService } from '../services/socialService'
import { formatNumber, formatPercent } from '../utils/format'
import PlatformIcon from '../components/PlatformIcon'
import AnalyticsSourceToggle, { AnalyticsDataSource } from '../components/dashboard/AnalyticsSourceToggle'
import LiveModeBanner from '../components/dashboard/LiveModeBanner'
import YouTubeLiveDashboardSection from '../components/dashboard/YouTubeLiveDashboardSection'
import {
  KPICard,
  PlatformSelector,
  ChartCard,
  DataTable,
  StatusBadge,
  KPISkeleton,
  ChartSkeleton,
  TableSkeleton,
  ErrorState,
} from '../components/ui'

const PIE_COLORS = ['#ef4444', '#e1306c', '#06b6d4', '#1877f2', '#0a66c2', '#0f172a', '#8b5cf6']

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
}

interface TopContentItem {
  content_title: string
  platform: string
  views: number
  reach: number
  watch_time?: number
  engagement_rate: number
}

interface RecentNotification {
  id: number
  title: string
  message: string
  notification_type: string
  created_at: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const querySource = searchParams.get('source')
  const queryPlatform = searchParams.get('platform')
  const queryTab = searchParams.get('tab') || searchParams.get('view')

  const initialIsLiveYouTube =
    queryTab === 'youtube_live' ||
    queryTab === 'youtube' ||
    (querySource === 'live' && queryPlatform?.toLowerCase() === 'youtube')

  const [activeView, setActiveView] = useState<'overview' | 'youtube_live'>(
    initialIsLiveYouTube ? 'youtube_live' : 'overview'
  )
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    initialIsLiveYouTube ? 'YouTube' : (queryPlatform || 'All')
  )
  const [dataSource, setDataSource] = useState<AnalyticsDataSource>(
    initialIsLiveYouTube ? 'live' : ((querySource === 'live' ? 'live' : 'database') as AnalyticsDataSource)
  )
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [disconnectedPlatforms, setDisconnectedPlatforms] = useState<string[]>([])
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | undefined>()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [revenueTotal, setRevenueTotal] = useState<number>(0)
  const [revenueCurrency, setRevenueCurrency] = useState<string>('INR')
  const [engagementTrend, setEngagementTrend] = useState<{ date: string; value: number }[]>([])
  const [followersTrend, setFollowersTrend] = useState<{ date: string; value: number }[]>([])
  const [revenueMonthly, setRevenueMonthly] = useState<{ month: string; revenue: number }[]>([])
  const [platformData, setPlatformData] = useState<{ name: string; views: number; reach: number; engagement_rate: number }[]>([])
  const [topContent, setTopContent] = useState<TopContentItem[]>([])
  const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([])
  const [activeChartTab, setActiveChartTab] = useState<'engagement' | 'followers'>('engagement')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async (sourceOverride?: AnalyticsDataSource) => {
    setLoading(true)
    setError('')
    const activeSource = sourceOverride || dataSource
    try {
      const platformParam = selectedPlatform === 'All' ? undefined : selectedPlatform
      const [
        summaryRes,
        engChartRes,
        folChartRes,
        platformRes,
        topContentRes,
        revSummaryRes,
        revMonthlyRes,
        notifRes,
        socialRes,
      ] = await Promise.allSettled([
        analyticsApi.summary(platformParam, activeSource),
        analyticsApi.engagementChart(platformParam, activeSource),
        analyticsApi.followersChart(activeSource),
        analyticsApi.platformComparison(activeSource),
        analyticsApi.topContent(platformParam, activeSource),
        analyticsApi.revenueSummary(),
        analyticsApi.revenueMonthly(),
        notificationApi.list({ limit: 4 }),
        socialService.getStatus(),
      ])

      // 1. Summary KPIs
      if (summaryRes.status === 'fulfilled') {
        const sumData = summaryRes.value.data
        setSummary(sumData)
        if (sumData?.connected_platforms && Array.isArray(sumData.connected_platforms)) {
          setConnectedPlatforms(sumData.connected_platforms)
        }
        if (sumData?.disconnected_platforms && Array.isArray(sumData.disconnected_platforms)) {
          setDisconnectedPlatforms(sumData.disconnected_platforms)
        }
        if (sumData?.last_refreshed_at) {
          setLastRefreshedAt(sumData.last_refreshed_at)
        }
      }

      // Check social connections status
      if (socialRes.status === 'fulfilled' && Array.isArray(socialRes.value)) {
        const liveConns = socialRes.value
          .filter((c) => c.status === 'connected')
          .map((c) => {
            const p = (c.platform || '').toLowerCase()
            if (p === 'twitter' || p === 'x') return 'X (Twitter)'
            return c.platform.charAt(0).toUpperCase() + c.platform.slice(1)
          })
        if (liveConns.length > 0) {
          setConnectedPlatforms((prev) => (prev.length === 0 ? liveConns : prev))
        }
      }

      // 2. Revenue Summary
      if (revSummaryRes.status === 'fulfilled') {
        setRevenueTotal(revSummaryRes.value.data?.total_revenue ?? 0)
        setRevenueCurrency(revSummaryRes.value.data?.currency || 'INR')
      }

      // 3. Engagement Chart
      if (engChartRes.status === 'fulfilled') {
        const engData: ChartResponse = engChartRes.value.data || { labels: [], values: [] }
        setEngagementTrend(
          (engData.labels || []).map((date, idx) => ({
            date: date.length > 5 ? date.slice(5) : date,
            value: engData.values?.[idx] ?? 0,
          }))
        )
      }

      // 4. Followers Chart
      if (folChartRes.status === 'fulfilled') {
        const folData: ChartResponse = folChartRes.value.data || { labels: [], values: [] }
        setFollowersTrend(
          (folData.labels || []).map((date, idx) => ({
            date: date.length > 5 ? date.slice(5) : date,
            value: folData.values?.[idx] ?? 0,
          }))
        )
      }

      // 5. Monthly Revenue Trend
      if (revMonthlyRes.status === 'fulfilled') {
        setRevenueMonthly(revMonthlyRes.value.data || [])
      }

      // 6. Platform Comparison
      if (platformRes.status === 'fulfilled') {
        const rawPlatforms: Record<string, PlatformMetric> = platformRes.value.data || {}
        setPlatformData(
          Object.entries(rawPlatforms).map(([name, data]) => ({
            name,
            views: data.views ?? 0,
            reach: data.reach ?? 0,
            engagement_rate: data.engagement_rate ?? 0,
          }))
        )
      }

      // 7. Top Content
      if (topContentRes.status === 'fulfilled') {
        setTopContent(topContentRes.value.data || [])
      }

      // 8. Notifications
      if (notifRes.status === 'fulfilled') {
        setRecentNotifications(notifRes.value.data || [])
      }
    } catch {
      setError('Unable to load dashboard metrics. Please check connection and retry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedPlatform, dataSource])

  useEffect(() => {
    const s = searchParams.get('source')
    const p = searchParams.get('platform')
    const tab = searchParams.get('tab') || searchParams.get('view')
    if (tab === 'youtube_live' || tab === 'youtube' || (s === 'live' && p?.toLowerCase() === 'youtube')) {
      setActiveView('youtube_live')
      setDataSource('live')
      setSelectedPlatform('YouTube')
    } else if (tab === 'overview') {
      setActiveView('overview')
    }
  }, [searchParams])

  // Content table columns configuration
  const contentColumns = [
    {
      header: 'Content',
      accessor: (item: TopContentItem) => (
        <div className="flex items-center gap-2.5 min-w-[200px]">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 border border-slate-200/80 shrink-0">
            <PlatformIcon platform={item.platform} className="h-3.5 w-3.5" />
          </div>
          <span className="font-bold text-slate-900 truncate">{item.content_title}</span>
        </div>
      ),
    },
    {
      header: 'Platform',
      accessor: (item: TopContentItem) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
          <PlatformIcon platform={item.platform} className="h-3 w-3" />
          {item.platform}
        </span>
      ),
    },
    {
      header: 'Views',
      accessor: (item: TopContentItem) => (
        <span className="font-extrabold text-slate-900">{formatNumber(item.views)}</span>
      ),
    },
    {
      header: 'Reach',
      accessor: (item: TopContentItem) => (
        <span className="text-slate-600">{formatNumber(item.reach)}</span>
      ),
    },
    {
      header: 'Engagement',
      accessor: (item: TopContentItem) => (
        <span className="font-bold text-emerald-600">{formatPercent(item.engagement_rate)}</span>
      ),
    },
    {
      header: 'Watch Time',
      accessor: (item: TopContentItem) => (
        <span className="text-slate-500">{item.watch_time ? `${Math.round(item.watch_time)}h` : '—'}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Welcome Header & Dual-Source Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back{user?.full_name ? `, ${user.full_name}` : ''}
            </h2>
            {dataSource === 'live' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 px-2.5 py-0.5 text-[11px] font-extrabold shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live API Stream
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 text-[11px] font-extrabold shadow-2xs">
                <Database className="h-3 w-3" />
                Saved Analytics
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
            {dataSource === 'live'
              ? 'Real-time multi-platform metrics aggregated directly from your connected social accounts.'
              : 'Overview of multi-platform analytics, audience trajectories, and monetization metrics.'}
          </p>
        </div>

        {/* Source Switcher, Platform Selector, and Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Data Source Switcher: Database vs Live API */}
          <AnalyticsSourceToggle
            value={dataSource}
            onChange={(newSource) => {
              setDataSource(newSource)
              loadData(newSource)
            }}
            connectedCount={connectedPlatforms.length}
          />

          {/* Compact Platform Selector with Icons */}
          <PlatformSelector selected={selectedPlatform} onChange={setSelectedPlatform} />

          <button
            type="button"
            onClick={() => loadData()}
            title="Refresh metrics"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveView('overview')
              setSearchParams({})
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'overview'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Multi-Platform Overview</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveView('youtube_live')
              setDataSource('live')
              setSelectedPlatform('YouTube')
              setSearchParams({ source: 'live', platform: 'YouTube' })
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'youtube_live'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-red-50 hover:text-red-700 border border-slate-200/80'
            }`}
          >
            <PlatformIcon platform="youtube" size={14} variant="solid" />
            <span>YouTube Live Telemetry</span>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                activeView === 'youtube_live' ? 'bg-white' : 'bg-red-500 animate-pulse'
              }`}
            />
          </button>
        </div>

        {activeView === 'youtube_live' && (
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
            Direct YouTube Data API v3 live telemetry embedded in Workspace
          </span>
        )}
      </div>

      {/* Conditionally render YouTube Live Telemetry or Multi-Platform Overview */}
      {activeView === 'youtube_live' || (dataSource === 'live' && selectedPlatform.toLowerCase() === 'youtube') ? (
        <YouTubeLiveDashboardSection
          onSyncComplete={() => loadData()}
          onBackToOverview={() => {
            setActiveView('overview')
            setDataSource('database')
            setSelectedPlatform('All')
            setSearchParams({})
          }}
        />
      ) : (
        <>
          {/* Mode Context Banner */}
          <LiveModeBanner
            mode={dataSource}
            connectedPlatforms={connectedPlatforms}
            disconnectedPlatforms={disconnectedPlatforms}
            selectedPlatform={selectedPlatform}
            onSyncComplete={() => loadData()}
            onRefresh={() => loadData()}
            lastRefreshedAt={lastRefreshedAt}
          />

      {error && <ErrorState message={error} onRetry={loadData} />}

      {/* 2. 7 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 7 }).map((_, i) => <KPISkeleton key={i} />)
        ) : (
          <>
            <KPICard
              title="Total Views"
              value={formatNumber(summary?.total_views ?? 0)}
              icon={Eye}
              color="blue"
              change={12.4}
              changeLabel="vs last month"
            />
            <KPICard
              title="Total Likes"
              value={formatNumber(summary?.total_likes ?? 0)}
              icon={Heart}
              color="rose"
              change={8.1}
              changeLabel="vs last month"
            />
            <KPICard
              title="Total Comments"
              value={formatNumber(summary?.total_comments ?? 0)}
              icon={MessageSquare}
              color="indigo"
              change={4.5}
              changeLabel="vs last month"
            />
            <KPICard
              title="Total Reach"
              value={formatNumber(summary?.total_reach ?? 0)}
              icon={Share2}
              color="slate"
              change={15.3}
              changeLabel="vs last month"
            />
            <KPICard
              title="Total Followers"
              value={formatNumber(summary?.total_followers ?? 0)}
              icon={Users}
              color="emerald"
              change={9.2}
              changeLabel="vs last month"
            />
            <KPICard
              title="Engagement Rate"
              value={formatPercent(summary?.average_engagement_rate ?? 0)}
              icon={Zap}
              color="amber"
              change={2.4}
              changeLabel="vs last month"
            />
            <KPICard
              title="Total Revenue"
              value={`${revenueCurrency === 'INR' ? '₹' : '$'}${revenueTotal.toLocaleString()}`}
              icon={DollarSign}
              color="emerald"
              change={18.0}
              changeLabel="verified earnings"
            />
          </>
        )}
      </div>

      {/* 3. Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Engagement vs Followers Trend */}
        <ChartCard
          title={activeChartTab === 'engagement' ? 'Engagement Trend' : 'Follower Growth Trajectory'}
          subtitle="Real-time timeline analysis from platform syncs"
          action={
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveChartTab('engagement')}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  activeChartTab === 'engagement' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Engagement
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('followers')}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  activeChartTab === 'followers' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Followers
              </button>
            </div>
          }
          loading={loading}
          empty={
            activeChartTab === 'engagement'
              ? engagementTrend.length === 0
              : followersTrend.length === 0
          }
        >
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === 'engagement' ? (
                <AreaChart data={engagementTrend}>
                  <defs>
                    <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                    formatter={(val: number) => [`${val.toFixed(2)}%`, 'Engagement Rate']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#engGrad)" />
                </AreaChart>
              ) : (
                <AreaChart data={followersTrend}>
                  <defs>
                    <linearGradient id="folGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                    formatter={(val: number) => [val.toLocaleString(), 'Followers']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#folGrad)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 2: Platform Breakdown & Distribution */}
        <ChartCard
          title="Platform Comparison"
          subtitle="Reach and audience distribution by connected channels"
          loading={loading}
          empty={platformData.length === 0}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 h-64 sm:h-72 w-full pt-2">
            <div className="h-full w-full sm:w-1/2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    dataKey="reach"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                    formatter={(val: number) => [val.toLocaleString(), 'Reach']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Platform Legend Details */}
            <div className="w-full sm:w-1/2 flex flex-col justify-center space-y-2 text-xs">
              {platformData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <PlatformIcon platform={item.name} className="h-3.5 w-3.5" />
                    <span className="font-bold text-slate-800">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900">{formatNumber(item.reach)}</span>
                    <span className="text-[10px] text-slate-400 block">{formatPercent(item.engagement_rate)} eng</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* 4. Top Performing Content Section */}
      <div className="ciq-card">
        <div className="ciq-card-header">
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">Top Performing Content</h3>
            <p className="text-xs text-slate-500 mt-0.5">Highest engagement content records across your active channels</p>
          </div>
          <Link
            to="/content-analytics"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>View All Content</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <DataTable
          columns={contentColumns}
          data={topContent}
          keyExtractor={(item, idx) => `${item.content_title}-${idx}`}
          loading={loading}
          emptyMessage="No top content data available for this platform."
          emptyAction={
            <Link to="/content" className="ciq-btn-primary">
              <Video className="h-3.5 w-3.5" />
              <span>Explore Content Library</span>
            </Link>
          }
        />
      </div>

      {/* 5. Recent Activity & Monetization Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="lg:col-span-2 ciq-card">
          <div className="ciq-card-header">
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900">Revenue Trajectory</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly earnings from sponsorships, ads, and partnerships</p>
            </div>
            <Link
              to="/revenue"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>Manage Revenue</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-60 w-full pt-2">
            {loading ? (
              <ChartSkeleton height="h-60" />
            ) : revenueMonthly.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                No monthly revenue logs recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                    formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="ciq-card flex flex-col justify-between">
          <div>
            <div className="ciq-card-header">
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-slate-900">Recent Activity</h3>
                <p className="text-xs text-slate-500 mt-0.5">Automated insights & alerts</p>
              </div>
              <Link to="/notifications" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                Inbox
              </Link>
            </div>

            <div className="space-y-3">
              {recentNotifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No alerts generated yet.</p>
              ) : (
                recentNotifications.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 truncate">{n.title}</span>
                      <StatusBadge status={n.notification_type || 'info'} />
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to="/social-connections"
              className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 hover:bg-indigo-100/70 transition-colors text-indigo-900 text-xs font-bold"
            >
              <span>Connect More Social Channels</span>
              <ArrowUpRight className="h-4 w-4 text-indigo-600" />
            </Link>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
