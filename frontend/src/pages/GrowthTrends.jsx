import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import PlatformSelector from '../components/PlatformSelector'
import { LoadingState, EmptyState, ErrorState } from '../components/StateBlocks'
import { getGrowthTrend } from '../services/audienceService'
import { listContent } from '../services/contentService'
import { getCrossPlatformSummary } from '../services/platformService'

// Groups Content records (each already has publish_date, views,
// engagement_rate from the backend) into one point per month. This is
// display bucketing of numbers the backend already computed -- not a
// new analytics calculation -- same pattern RevenueDashboard.jsx
// already uses for its monthly trend chart.
function groupContentByMonth(items) {
  const byMonth = {}
  for (const item of items) {
    const month = item.publish_date.slice(0, 7)
    if (!byMonth[month]) {
      byMonth[month] = { month, views: 0, totalEngagementRate: 0, count: 0 }
    }
    byMonth[month].views += item.views
    byMonth[month].totalEngagementRate += item.engagement_rate
    byMonth[month].count += 1
  }
  return Object.values(byMonth)
    .map((m) => ({
      month: m.month,
      views: m.views,
      avgEngagementRate: Math.round((m.totalEngagementRate / m.count) * 100) / 100,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export default function GrowthTrends() {
  const [platform, setPlatform] = useState('all')
  const [growthTrend, setGrowthTrend] = useState([])
  const [contentTrend, setContentTrend] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const platformParam = platform === 'all' ? undefined : platform
        const [growth, contentItems, kpiSummary] = await Promise.all([
          getGrowthTrend(platformParam, 180),
          listContent({ platform: platformParam, limit: 100 }).then((r) => r.items),
          getCrossPlatformSummary(),
        ])
        setGrowthTrend(growth)
        setContentTrend(groupContentByMonth(contentItems))
        setSummary(kpiSummary)
      } catch (err) {
        setError('Could not load growth data. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [platform])

  return (
    <AppLayout>
        <PageHeader
          title="Growth & Trends"
          subtitle="Follower growth and content performance over time."
          actions={<PlatformSelector value={platform} onChange={setPlatform} />}
        />

        {error && <ErrorState message={error} />}
        {loading && <LoadingState label="Loading growth data..." />}

        {!loading && !error && (
          <>
            {summary && (
              <div className="kpi-grid" style={{ maxWidth: 'none', marginTop: '1.5rem' }}>
                <div className="kpi-card">
                  <span className="kpi-label">Total Followers</span>
                  <span className="kpi-value">{summary.total_followers.toLocaleString()}</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Platforms Tracked</span>
                  <span className="kpi-value">{summary.platforms_tracked}</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Total Content</span>
                  <span className="kpi-value">{summary.total_content}</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Avg Engagement</span>
                  <span className="kpi-value">{summary.overall_avg_engagement_rate}%</span>
                </div>
              </div>
            )}

            <section className="chart-section">
              <h2>Follower Growth</h2>
              {growthTrend.length === 0 ? (
                <EmptyState
                  title="No growth data yet"
                  description="Sync YouTube or seed Instagram sample data to see growth trends here."
                />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={growthTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                    <XAxis dataKey="record_date" stroke="#9aa0a6" />
                    <YAxis stroke="#9aa0a6" />
                    <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                    <Line type="monotone" dataKey="follower_count" stroke="#7c5cff" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </section>

            <section className="chart-section">
              <h2>Views Trend</h2>
              {contentTrend.length === 0 ? (
                <EmptyState title="No content yet" description="Add content to see a views trend." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={contentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                    <XAxis dataKey="month" stroke="#9aa0a6" />
                    <YAxis stroke="#9aa0a6" />
                    <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                    <Line type="monotone" dataKey="views" stroke="#4ecdc4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </section>

            <section className="chart-section">
              <h2>Engagement Rate Trend</h2>
              {contentTrend.length === 0 ? (
                <EmptyState title="No content yet" description="Add content to see an engagement trend." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={contentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                    <XAxis dataKey="month" stroke="#9aa0a6" />
                    <YAxis stroke="#9aa0a6" />
                    <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                    <Line type="monotone" dataKey="avgEngagementRate" stroke="#ff6b9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </section>
          </>
        )}
      </AppLayout>
  )
}
