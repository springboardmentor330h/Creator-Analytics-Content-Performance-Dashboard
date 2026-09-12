import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import PlatformSelector from '../components/PlatformSelector'
import { LoadingState, EmptyState, ErrorState } from '../components/StateBlocks'
import { getPlatformComparison, listContent } from '../services/contentService'

// Derives platform-filtered KPIs and a top-performing list from raw
// Content records (each already carries a backend-computed
// engagement_rate). This is filtering/aggregating numbers the backend
// already calculated -- not a new analytics calculation -- since
// /content/analytics/summary and /top-performing don't take a
// platform filter param and duplicating that logic in Python would
// violate the "no duplicate analytics logic" rule.
function deriveKpiFromItems(items) {
  if (items.length === 0) {
    return { total_content: 0, total_reach: 0, total_impressions: 0, avg_engagement_rate: 0 }
  }
  const total_reach = items.reduce((sum, i) => sum + i.reach, 0)
  const total_impressions = items.reduce((sum, i) => sum + i.impressions, 0)
  const avg_engagement_rate = Math.round(
    (items.reduce((sum, i) => sum + i.engagement_rate, 0) / items.length) * 100
  ) / 100
  return { total_content: items.length, total_reach, total_impressions, avg_engagement_rate }
}

function topFromItems(items, limit = 5) {
  return [...items].sort((a, b) => b.engagement_rate - a.engagement_rate).slice(0, limit)
}

export default function ContentAnalytics() {
  const [platform, setPlatform] = useState('all')
  const [kpi, setKpi] = useState(null)
  const [topContent, setTopContent] = useState([])
  const [platformData, setPlatformData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const platformParam = platform === 'all' ? undefined : platform
        const [{ items }, platforms] = await Promise.all([
          listContent({ platform: platformParam, limit: 100 }),
          getPlatformComparison(),
        ])
        setKpi(deriveKpiFromItems(items))
        setTopContent(topFromItems(items))
        setPlatformData(platforms)
      } catch (err) {
        setError('Could not load analytics. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [platform])

  return (
    <AppLayout>
      <PageHeader
        title="Content Analytics"
        subtitle="Engagement and performance across your content."
        actions={<PlatformSelector value={platform} onChange={setPlatform} />}
      />

      {error && <ErrorState message={error} />}
      {loading && <LoadingState label="Loading content analytics..." />}

      {!loading && !error && kpi && (
        <>
          <div className="kpi-grid" style={{ maxWidth: 'none', marginTop: '1.5rem' }}>
            <div className="kpi-card">
              <span className="kpi-label">Total Content</span>
              <span className="kpi-value">{kpi.total_content}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Total Reach</span>
              <span className="kpi-value">{kpi.total_reach.toLocaleString()}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Total Impressions</span>
              <span className="kpi-value">{kpi.total_impressions.toLocaleString()}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Avg Engagement Rate</span>
              <span className="kpi-value">{kpi.avg_engagement_rate}%</span>
            </div>
          </div>

          {platform === 'all' && (
            <section className="chart-section">
              <h2>Platform Comparison</h2>
              {platformData.length === 0 ? (
                <EmptyState title="No platform data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                    <XAxis dataKey="platform" stroke="#9aa0a6" />
                    <YAxis stroke="#9aa0a6" />
                    <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                    <Bar dataKey="avg_engagement_rate" fill="#7c5cff" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>
          )}

          <section className="table-section">
            <h2>Top Performing Content</h2>
            {topContent.length === 0 ? (
              <EmptyState title="No content yet" description="Add content or sync a platform to see it here." />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Platform</th>
                    <th>Reach</th>
                    <th>Engagement Rate</th>
                  </tr>
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
        </>
      )}
    </AppLayout>
  )
}
