import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { LoadingState, EmptyState, ErrorState } from '../components/StateBlocks'
import {
  listSponsorships, createSponsorship, updateSponsorshipStatus, deleteSponsorship,
} from '../services/revenueService'

export default function Sponsorships() {
  const [sponsorships, setSponsorships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function load() {
    try {
      const data = await listSponsorships()
      setSponsorships(data)
    } catch (err) {
      setError('Could not load sponsorships. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    const form = e.target
    await createSponsorship({
      brand: form.brand.value,
      campaign: form.campaign.value,
      amount: parseFloat(form.amount.value),
      status: form.status.value,
      start_date: form.start_date.value,
      end_date: form.end_date.value || null,
    })
    setShowForm(false)
    load()
  }

  async function handleStatusChange(id, newStatus) {
    await updateSponsorshipStatus(id, newStatus)
    load()
  }

  async function handleDelete(id) {
    await deleteSponsorship(id)
    load()
  }

  return (
    <AppLayout>
        <PageHeader
          title="Sponsorships"
          subtitle="Brand deals and campaign tracking."
          actions={
            <button className="btn-small" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ Add sponsorship'}
            </button>
          }
        />

        {error && <ErrorState message={error} />}

        {showForm && (
          <form className="inline-form" onSubmit={handleAdd} style={{ marginTop: '1rem' }}>
            <input name="brand" placeholder="Brand" required />
            <input name="campaign" placeholder="Campaign" required />
            <input name="amount" type="number" step="0.01" placeholder="Amount" required />
            <input name="start_date" type="date" required />
            <input name="end_date" type="date" placeholder="End date (optional)" />
            <select name="status" defaultValue="pending">
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <button type="submit">Save</button>
          </form>
        )}

        {loading && <LoadingState label="Loading sponsorships..." />}

        {!loading && !error && sponsorships.length === 0 && (
          <EmptyState
            title="No sponsorships yet"
            description="Add your first brand deal to start tracking it here."
          />
        )}

        {!loading && sponsorships.length > 0 && (
          <div className="sponsorship-grid">
            {sponsorships.map((s) => (
              <div key={s.id} className="sponsorship-card">
                <div className="sponsorship-card-header">
                  <span className="sponsorship-brand">{s.brand}</span>
                  <StatusBadge label={s.status} variant={s.status} />
                </div>
                <div className="sponsorship-campaign">{s.campaign}</div>
                <div className="sponsorship-amount">${s.amount.toLocaleString()}</div>
                <div className="sponsorship-dates text-muted">
                  {s.start_date}{s.end_date ? ` — ${s.end_date}` : ' — ongoing'}
                </div>
                <div className="sponsorship-actions">
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
                  <button className="btn-link-delete" onClick={() => handleDelete(s.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppLayout>
  )
}
