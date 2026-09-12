import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import PlatformSelector from '../components/PlatformSelector'
import { LoadingState, EmptyState, ErrorState } from '../components/StateBlocks'
import {
  getAudienceKpiSummary, getAgeBreakdown, getGenderBreakdown,
  getGeographicBreakdown, getGrowthTrend,
} from '../services/audienceService'

const PIE_COLORS = ['#7c5cff', '#ff6b9d', '#4ecdc4', '#ffd166', '#a78bfa', '#f97316']

export default function AudienceAnalytics() {
  const [platform, setPlatform] = useState('all')
  const [kpi, setKpi] = useState(null)
  const [ageData, setAgeData] = useState([])
  const [genderData, setGenderData] = useState([])
  const [geoData, setGeoData] = useState([])
  const [growthData, setGrowthData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        // Demographics (age/gender/geography) aren't tracked per-platform
        // filter in the backend -- they're always a cross-platform
        // aggregate. The platform selector here filters what it
        // genuinely CAN filter: follower growth, which the backend's
        // /growth/trend endpoint does support per-platform.
        const platformParam = platform === 'all' ? undefined : platform
        const [kpiRes, age, gender, geo, growth] = await Promise.all([
          getAudienceKpiSummary(),
          getAgeBreakdown(),
          getGenderBreakdown(),
          getGeographicBreakdown(),
          getGrowthTrend(platformParam, 180),
        ])
        setKpi(kpiRes)
        setAgeData(age)
        setGenderData(gender)
        setGeoData(geo.slice(0, 6))
        setGrowthData(growth)
      } catch (err) {
        setError('Could not load audience analytics. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [platform])

  return (
    <AppLayout>
      <PageHeader
        title="Audience Analytics"
        subtitle="Who your audience is, and how it's growing."
        actions={<PlatformSelector value={platform} onChange={setPlatform} />}
      />

      {error && <ErrorState message={error} />}
      {loading && <LoadingState label="Loading audience analytics..." />}

      {!loading && !error && kpi && (
        <>
          <div className="kpi-grid" style={{ maxWidth: 'none', marginTop: '1.5rem' }}>
            <div className="kpi-card">
              <span className="kpi-label">Total Followers</span>
              <span className="kpi-value">{kpi.total_followers.toLocaleString()}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Growth Rate</span>
              <span className="kpi-value">{kpi.total_growth_rate_percent}%</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Top Country</span>
              <span className="kpi-value">{kpi.top_country || 'Not available'}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Top Age Group</span>
              <span className="kpi-value">{kpi.top_age_group || 'Not available'}</span>
            </div>
          </div>

          <section className="chart-section">
            <h2>Follower Growth ({platform === 'all' ? 'select a platform above' : platform}, last 180 days)</h2>
            {platform === 'all' ? (
              <EmptyState
                title="Select a platform to view growth"
                description="Follower growth is tracked per platform — pick YouTube, Instagram, or TikTok above."
              />
            ) : growthData.length === 0 ? (
              <EmptyState title="No growth data for this platform yet" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                  <XAxis dataKey="record_date" stroke="#9aa0a6" />
                  <YAxis stroke="#9aa0a6" />
                  <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                  <Line type="monotone" dataKey="follower_count" stroke="#7c5cff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </section>

          <p className="text-muted" style={{ marginTop: '1.5rem' }}>
            Demographics below are cross-platform (not filterable by the selector above).
          </p>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <section className="chart-section" style={{ flex: '1 1 380px' }}>
              <h2>Age Distribution</h2>
              {ageData.length === 0 ? (
                <EmptyState title="No demographic data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={ageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                    <XAxis dataKey="label" stroke="#9aa0a6" />
                    <YAxis stroke="#9aa0a6" />
                    <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                    <Bar dataKey="percentage" fill="#7c5cff" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>

            <section className="chart-section" style={{ flex: '1 1 300px' }}>
              <h2>Gender Split</h2>
              {genderData.length === 0 ? (
                <EmptyState title="No demographic data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      dataKey="percentage"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={(entry) => `${entry.label}: ${entry.percentage}%`}
                    >
                      {genderData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </section>
          </div>

          <section className="table-section">
            <h2>Top Countries</h2>
            {geoData.length === 0 ? (
              <EmptyState title="No geographic data yet" />
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Country</th><th>Audience Share</th></tr>
                </thead>
                <tbody>
                  {geoData.map((row) => (
                    <tr key={row.country}>
                      <td>{row.country}</td>
                      <td>{row.percentage}%</td>
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
