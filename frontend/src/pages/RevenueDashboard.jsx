import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { LoadingState, EmptyState, ErrorState } from '../components/StateBlocks'
import {
  getRevenueKpiSummary, getMonthlyRevenueTrend, getRevenueByPlatform,
  listRevenue, createRevenue, deleteRevenue,
} from '../services/revenueService'

export default function RevenueDashboard() {
  const [kpi, setKpi] = useState(null)
  const [trend, setTrend] = useState([])
  const [byPlatform, setByPlatform] = useState([])
  const [revenueList, setRevenueList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRevenueForm, setShowRevenueForm] = useState(false)

  async function loadAll() {
    try {
      const [kpiRes, trendRes, platformRes, revRes] = await Promise.all([
        getRevenueKpiSummary(),
        getMonthlyRevenueTrend(),
        getRevenueByPlatform(),
        listRevenue(),
      ])
      setKpi(kpiRes)
      setTrend(trendRes)
      setByPlatform(platformRes)
      setRevenueList(revRes)
    } catch (err) {
      setError('Could not load revenue data. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  async function handleAddRevenue(e) {
    e.preventDefault()
    const form = e.target
    await createRevenue({
      source: form.source.value,
      amount: parseFloat(form.amount.value),
      currency: 'USD',
      date: form.date.value,
      revenue_type: form.revenue_type.value,
      status: form.status.value,
    })
    setShowRevenueForm(false)
    loadAll()
  }

  async function handleDeleteRevenue(id) {
    await deleteRevenue(id)
    loadAll()
  }

  return (
    <AppLayout>
        <PageHeader
          title="Revenue"
          subtitle="Income across platforms and sources."
          actions={
            <Link to="/sponsorships" className="btn-small btn-secondary-link">
              View Sponsorships →
            </Link>
          }
        />

        {error && <ErrorState message={error} />}
        {loading && <LoadingState label="Loading revenue data..." />}

        {!loading && kpi && (
          <>
            <div className="kpi-grid" style={{ maxWidth: 'none', marginTop: '1.5rem' }}>
              <div className="kpi-card">
                <span className="kpi-label">Total Revenue</span>
                <span className="kpi-value">${kpi.total_revenue.toLocaleString()}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Pending Revenue</span>
                <span className="kpi-value">${kpi.pending_revenue.toLocaleString()}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Sponsorship Value</span>
                <span className="kpi-value">${kpi.total_sponsorship_value.toLocaleString()}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Active Sponsorships</span>
                <span className="kpi-value">{kpi.active_sponsorships}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <section className="chart-section" style={{ flex: '1 1 380px' }}>
                <h2>Monthly Revenue Trend</h2>
                {trend.length === 0 ? (
                  <EmptyState title="No revenue history yet" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                      <XAxis dataKey="month" stroke="#9aa0a6" />
                      <YAxis stroke="#9aa0a6" />
                      <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                      <Line type="monotone" dataKey="total" stroke="#4ecdc4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </section>

              <section className="chart-section" style={{ flex: '1 1 380px' }}>
                <h2>Revenue by Platform</h2>
                {byPlatform.length === 0 ? (
                  <EmptyState title="No revenue by platform yet" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byPlatform}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                      <XAxis dataKey="source" stroke="#9aa0a6" />
                      <YAxis stroke="#9aa0a6" />
                      <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                      <Bar dataKey="total" fill="#7c5cff" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </section>
            </div>

            <section className="table-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Revenue Records</h2>
                <button className="btn-small" onClick={() => setShowRevenueForm(!showRevenueForm)}>
                  {showRevenueForm ? 'Cancel' : '+ Add revenue'}
                </button>
              </div>

              {showRevenueForm && (
                <form className="inline-form" onSubmit={handleAddRevenue}>
                  <select name="source" defaultValue="youtube">
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                  <select name="revenue_type" defaultValue="ad_revenue">
                    <option value="ad_revenue">Ad Revenue</option>
                    <option value="sponsorship">Sponsorship</option>
                    <option value="affiliate">Affiliate</option>
                    <option value="merchandise">Merchandise</option>
                    <option value="membership">Membership</option>
                    <option value="other">Other</option>
                  </select>
                  <input name="amount" type="number" step="0.01" placeholder="Amount" required />
                  <input name="date" type="date" required />
                  <select name="status" defaultValue="received">
                    <option value="received">Received</option>
                    <option value="pending">Pending</option>
                  </select>
                  <button type="submit">Save</button>
                </form>
              )}

              {revenueList.length === 0 ? (
                <EmptyState title="No revenue records yet" description="Add your first revenue entry above." />
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th><th>Source</th><th>Type</th><th>Amount</th><th>Status</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueList.map((r) => (
                      <tr key={r.id}>
                        <td>{r.date}</td>
                        <td className="capitalize">{r.source}</td>
                        <td className="capitalize">{r.revenue_type.replace('_', ' ')}</td>
                        <td>${r.amount.toLocaleString()}</td>
                        <td><StatusBadge label={r.status} variant={r.status} /></td>
                        <td>
                          <button className="btn-link-delete" onClick={() => handleDeleteRevenue(r.id)}>Delete</button>
                        </td>
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
