import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import YouTubeSyncCard from '../components/YouTubeSyncCard'
import InstagramSeedCard from '../components/InstagramSeedCard'
import { LoadingState, EmptyState, ErrorState } from '../components/StateBlocks'
import { useAuth } from '../hooks/useAuth'
import { getKpiSummary, getTopPerforming } from '../services/contentService'
import { getAudienceKpiSummary, getGrowthTrend } from '../services/audienceService'
import { getRevenueKpiSummary, getMonthlyRevenueTrend } from '../services/revenueService'
import { getCrossPlatformSummary, getEngagementComparisonAcrossPlatforms } from '../services/platformService'

export default function Dashboard() {
  const { user } = useAuth()
  const [contentKpi, setContentKpi] = useState(null)
  const [audienceKpi, setAudienceKpi] = useState(null)
  const [revenueKpi, setRevenueKpi] = useState(null)
  const [topContent, setTopContent] = useState([])
  const [growthTrend, setGrowthTrend] = useState([])
  const [revenueTrend, setRevenueTrend] = useState([])
  const [platformEngagement, setPlatformEngagement] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [content, audience, revenue, top, growth, revTrend, platEngagement] = await Promise.all([
          getKpiSummary(),
          getAudienceKpiSummary(),
          getRevenueKpiSummary(),
          getTopPerforming(5),
          getGrowthTrend(undefined, 90),
          getMonthlyRevenueTrend(),
          getEngagementComparisonAcrossPlatforms(),
        ])
        setContentKpi(content)
        setAudienceKpi(audience)
        setRevenueKpi(revenue)
        setTopContent(top)
        setGrowthTrend(growth)
        setRevenueTrend(revTrend)
        setPlatformEngagement(platEngagement)
      } catch (err) {
        setError('Could not load dashboard data. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome back, ${user?.name || ''}`}
        subtitle="Here's how your content is performing across platforms."
      />

      {error && <ErrorState message={error} />}
      {loading && <LoadingState label="Loading your dashboard..." />}

      {!loading && !error && (
        <>
          <div className="kpi-grid" style={{ maxWidth: 'none', marginTop: '1.5rem' }}>
            <div className="kpi-card">
              <span className="kpi-label">Total Content</span>
              <span className="kpi-value">{contentKpi.total_content}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Engagement Rate</span>
              <span className="kpi-value">{contentKpi.avg_engagement_rate}%</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Total Reach</span>
              <span className="kpi-value">{contentKpi.total_reach.toLocaleString()}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Followers</span>
              <span className="kpi-value">{audienceKpi.total_followers.toLocaleString()}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Total Revenue</span>
              <span className="kpi-value">${revenueKpi.total_revenue.toLocaleString()}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Active Sponsorships</span>
              <span className="kpi-value">{revenueKpi.active_sponsorships}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <section className="chart-section" style={{ flex: '1 1 380px' }}>
              <h2>Follower Growth (last 90 days)</h2>
              {growthTrend.length === 0 ? (
                <EmptyState title="No growth data yet" description="Sync YouTube or seed Instagram sample data." />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
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

            <section className="chart-section" style={{ flex: '1 1 380px' }}>
              <h2>Revenue Trend</h2>
              {revenueTrend.length === 0 ? (
                <EmptyState title="No revenue yet" description="Add revenue records to see a trend here." />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                    <XAxis dataKey="month" stroke="#9aa0a6" />
                    <YAxis stroke="#9aa0a6" />
                    <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                    <Line type="monotone" dataKey="total" stroke="#4ecdc4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </section>
          </div>

          <section className="chart-section">
            <h2>Engagement by Platform</h2>
            {platformEngagement.length === 0 ? (
              <EmptyState title="No platform data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={platformEngagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                  <XAxis dataKey="platform" stroke="#9aa0a6" />
                  <YAxis stroke="#9aa0a6" />
                  <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                  <Bar dataKey="avg_engagement_rate" fill="#ff6b9d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          <section className="table-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Top Performing Content</h2>
              <Link to="/analytics/content" className="btn-secondary-link">View all →</Link>
            </div>
            {topContent.length === 0 ? (
              <EmptyState title="No content yet" description="Add content or sync a platform to see your top performers." />
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Title</th><th>Platform</th><th>Reach</th><th>Engagement Rate</th></tr>
                </thead>
                <tbody>
                  {topContent.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td className="capitalize">{item.platform}</td>
                      <td>{item.reach.toLocaleString()}</td>
                      <td>{item.engagement_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <div style={{ flex: '1 1 380px' }}>
              <YouTubeSyncCard />
            </div>
            <div style={{ flex: '1 1 380px' }}>
              <InstagramSeedCard />
            </div>
          </div>
        </>
      )}
    </AppLayout>
  )
}
