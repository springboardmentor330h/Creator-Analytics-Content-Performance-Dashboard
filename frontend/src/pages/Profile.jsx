import { useState } from 'react'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { updateMyProfile } from '../services/authService'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await updateMyProfile({ name, email })
      await refreshUser()
      setMessage('Profile updated.')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Could not update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <AppLayout>
        <PageHeader title="Profile & Settings" subtitle="Manage your account details." />

        <div className="profile-card">
          <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="profile-name">{user.name}</div>
            <div className="text-muted">{user.email}</div>
            <span className="badge-live" style={{ marginTop: '0.4rem', display: 'inline-block' }}>
              {user.role}
            </span>
          </div>
        </div>

        <section className="table-section" style={{ maxWidth: 480 }}>
          <h2>Edit Profile</h2>

          {message && <div className="profile-success">{message}</div>}
          {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleSave} className="profile-form">
            <label htmlFor="profile-name">Name</label>
            <input id="profile-name" name="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />

            <label htmlFor="profile-email">Email</label>
            <input id="profile-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <button type="submit" className="btn-small" disabled={saving} style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </section>

        <section className="table-section" style={{ maxWidth: 480 }}>
          <h2>Account</h2>
          <table className="data-table">
            <tbody>
              <tr><td>Member since</td><td>{new Date(user.created_at).toLocaleDateString()}</td></tr>
              <tr><td>Role</td><td className="capitalize">{user.role}</td></tr>
            </tbody>
          </table>
        </section>
      </AppLayout>
  )
}
