import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import {
  getRevenueKpiSummary, getMonthlyRevenueTrend, getRevenueByPlatform,
  listRevenue, createRevenue, deleteRevenue,
  listSponsorships, createSponsorship, updateSponsorshipStatus, deleteSponsorship,
} from '../services/revenueService'

const STATUS_BADGE_CLASS = {
  active: 'badge-live',
  pending: 'badge-mock',
  completed: 'badge-live',
  cancelled: 'badge-mock',
}

export default function RevenueDashboard() {
  const [kpi, setKpi] = useState(null)
  const [trend, setTrend] = useState([])
  const [byPlatform, setByPlatform] = useState([])
  const [revenueList, setRevenueList] = useState([])
  const [sponsorships, setSponsorships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRevenueForm, setShowRevenueForm] = useState(false)
  const [showSponsorForm, setShowSponsorForm] = useState(false)

  async function loadAll() {
    try {
      const [kpiRes, trendRes, platformRes, revRes, sponRes] = await Promise.all([
        getRevenueKpiSummary(),
        getMonthlyRevenueTrend(),
        getRevenueByPlatform(),
        listRevenue(),
        listSponsorships(),
      ])
      setKpi(kpiRes)
      setTrend(trendRes)
      setByPlatform(platformRes)
      setRevenueList(revRes)
      setSponsorships(sponRes)
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

  async function handleAddSponsorship(e) {
    e.preventDefault()
    const form = e.target
    await createSponsorship({
      brand: form.brand.value,
      campaign: form.campaign.value,
      amount: parseFloat(form.amount.value),
      status: form.status.value,
      start_date: form.start_date.value,
    })
    setShowSponsorForm(false)
    loadAll()
  }

  async function handleStatusChange(id, newStatus) {
    await updateSponsorshipStatus(id, newStatus)
    loadAll()
  }

  async function handleDeleteSponsorship(id) {
    await deleteSponsorship(id)
    loadAll()
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1>Revenue & Sponsorships</h1>
        <p className="text-muted">Track income and brand deals across platforms.</p>

        {error && <div className="auth-error" style={{ marginTop: '1rem' }}>{error}</div>}
        {loading && <p className="text-muted" style={{ marginTop: '1rem' }}>Loading...</p>}

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
              {trend.length > 0 && (
                <section className="chart-section" style={{ flex: '1 1 380px' }}>
                  <h2>Monthly Revenue Trend</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                      <XAxis dataKey="month" stroke="#9aa0a6" />
                      <YAxis stroke="#9aa0a6" />
                      <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                      <Line type="monotone" dataKey="total" stroke="#4ecdc4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </section>
              )}

              {byPlatform.length > 0 && (
                <section className="chart-section" style={{ flex: '1 1 380px' }}>
                  <h2>Revenue by Platform</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byPlatform}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                      <XAxis dataKey="source" stroke="#9aa0a6" />
                      <YAxis stroke="#9aa0a6" />
                      <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid #2a2e3d' }} />
                      <Bar dataKey="total" fill="#7c5cff" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </section>
              )}
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
                <p className="text-muted">No revenue records yet.</p>
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
                        <td><span className={STATUS_BADGE_CLASS[r.status] || ''}>{r.status}</span></td>
                        <td>
                          <button className="btn-link-delete" onClick={() => handleDeleteRevenue(r.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="table-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Sponsorships</h2>
                <button className="btn-small" onClick={() => setShowSponsorForm(!showSponsorForm)}>
                  {showSponsorForm ? 'Cancel' : '+ Add sponsorship'}
                </button>
              </div>

              {showSponsorForm && (
                <form className="inline-form" onSubmit={handleAddSponsorship}>
                  <input name="brand" placeholder="Brand" required />
                  <input name="campaign" placeholder="Campaign" required />
                  <input name="amount" type="number" step="0.01" placeholder="Amount" required />
                  <input name="start_date" type="date" required />
                  <select name="status" defaultValue="pending">
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button type="submit">Save</button>
                </form>
              )}

              {sponsorships.length === 0 ? (
                <p className="text-muted">No sponsorships yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Brand</th><th>Campaign</th><th>Amount</th><th>Status</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sponsorships.map((s) => (
                      <tr key={s.id}>
                        <td>{s.brand}</td>
                        <td>{s.campaign}</td>
                        <td>${s.amount.toLocaleString()}</td>
                        <td>
                          <select
                            value={s.status}
                            onChange={(e) => handleStatusChange(s.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button className="btn-link-delete" onClick={() => handleDeleteSponsorship(s.id)}>Delete</button>
                        </td>
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
