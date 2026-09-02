import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import {
  getKpiSummary, getTopPerforming, getPlatformComparison,
} from '../services/contentService'

export default function ContentAnalytics() {
  const [kpi, setKpi] = useState(null)
  const [topContent, setTopContent] = useState([])
  const [platformData, setPlatformData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [kpiData, top, platforms] = await Promise.all([
          getKpiSummary(),
          getTopPerforming(5),
          getPlatformComparison(),
        ])
        setKpi(kpiData)
        setTopContent(top)
        setPlatformData(platforms)
      } catch (err) {
        setError('Could not load analytics. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1>Content Analytics</h1>
        <p className="text-muted">Engagement and performance across your content.</p>

        {error && <div className="auth-error" style={{ marginTop: '1rem' }}>{error}</div>}
        {loading && <p className="text-muted" style={{ marginTop: '1rem' }}>Loading...</p>}

        {!loading && kpi && (
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

            {platformData.length > 0 && (
              <section className="chart-section">
                <h2>Platform Comparison</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                    <XAxis dataKey="platform" stroke="#9aa0a6" />
                    <YAxis stroke="#9aa0a6" />
                    <Tooltip
                      contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }}
                    />
                    <Bar dataKey="avg_engagement_rate" fill="#7c5cff" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </section>
            )}

            <section className="table-section">
              <h2>Top Performing Content</h2>
              {topContent.length === 0 ? (
                <p className="text-muted">No content yet. Add some via the API to see it here.</p>
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
      </main>
    </div>
  )
}
