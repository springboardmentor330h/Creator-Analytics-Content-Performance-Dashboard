import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import {
  getCrossPlatformSummary, getPlatformComparison,
  getGrowthComparison, getEngagementComparisonAcrossPlatforms,
} from '../services/platformService'

export default function PlatformComparison() {
  const [summary, setSummary] = useState(null)
  const [snapshots, setSnapshots] = useState([])
  const [growthComparison, setGrowthComparison] = useState([])
  const [engagementComparison, setEngagementComparison] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, comparisonRes, growthRes, engagementRes] = await Promise.all([
          getCrossPlatformSummary(),
          getPlatformComparison(),
          getGrowthComparison(),
          getEngagementComparisonAcrossPlatforms(),
        ])
        setSummary(summaryRes)
        setSnapshots(comparisonRes)
        setGrowthComparison(growthRes)
        setEngagementComparison(engagementRes)
      } catch (err) {
        setError('Could not load platform comparison. Is the backend running?')
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
        <h1>Multi-Platform Comparison</h1>
        <p className="text-muted">
          YouTube uses your real data. Instagram and TikTok show simulated
          data until those integrations are connected.
        </p>

        {error && <div className="auth-error" style={{ marginTop: '1rem' }}>{error}</div>}
        {loading && <p className="text-muted" style={{ marginTop: '1rem' }}>Loading...</p>}

        {!loading && summary && (
          <>
            <div className="kpi-grid" style={{ maxWidth: 'none', marginTop: '1.5rem' }}>
              <div className="kpi-card">
                <span className="kpi-label">Total Followers</span>
                <span className="kpi-value">{summary.total_followers.toLocaleString()}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Total Content</span>
                <span className="kpi-value">{summary.total_content}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Total Reach</span>
                <span className="kpi-value">{summary.total_reach.toLocaleString()}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Avg Engagement</span>
                <span className="kpi-value">{summary.overall_avg_engagement_rate}%</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <section className="chart-section" style={{ flex: '1 1 380px' }}>
                <h2>Growth Rate by Platform</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={growthComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                    <XAxis dataKey="platform" stroke="#9aa0a6" />
                    <YAxis stroke="#9aa0a6" />
                    <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                    <Bar dataKey="growth_rate_percent" fill="#4ecdc4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </section>

              <section className="chart-section" style={{ flex: '1 1 380px' }}>
                <h2>Engagement Rate by Platform</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={engagementComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                    <XAxis dataKey="platform" stroke="#9aa0a6" />
                    <YAxis stroke="#9aa0a6" />
                    <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                    <Bar dataKey="avg_engagement_rate" fill="#ff6b9d" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </section>
            </div>

            <section className="table-section">
              <h2>Platform Breakdown</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>Followers</th>
                    <th>Content</th>
                    <th>Reach</th>
                    <th>Engagement</th>
                    <th>Growth</th>
                    <th>Data Source</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((s) => (
                    <tr key={s.platform}>
                      <td className="capitalize">{s.platform}</td>
                      <td>{s.followers.toLocaleString()}</td>
                      <td>{s.total_content}</td>
                      <td>{s.total_reach.toLocaleString()}</td>
                      <td>{s.avg_engagement_rate}%</td>
                      <td>{s.growth_rate_percent}%</td>
                      <td>
                        <span className={s.is_mock_data ? 'badge-mock' : 'badge-live'}>
                          {s.is_mock_data ? 'Simulated' : 'Live'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
