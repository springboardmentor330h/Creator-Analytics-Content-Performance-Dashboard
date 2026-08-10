import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, Lock, ShieldCheck, User, Globe, Share2, Sparkles, UserCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'
import SocialIntegrationManager from '../components/SocialIntegrationManager'

type Tab = 'profile' | 'account' | 'security' | 'social'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [tab, setTab] = useState<Tab>('profile')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    avatar_url: '',
    youtube_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    website_url: '',
    tiktok_url: '',
    facebook_url: '',
  })

  useEffect(() => {
    if (!user) return
    setForm({
      full_name: user.full_name || '',
      bio: user.bio || '',
      avatar_url: user.avatar_url || '',
      youtube_url: user.youtube_url || '',
      instagram_url: user.instagram_url || '',
      twitter_url: user.twitter_url || '',
      linkedin_url: user.linkedin_url || '',
      website_url: user.website_url || '',
      tiktok_url: user.tiktok_url || '',
      facebook_url: user.facebook_url || '',
    })
  }, [user])

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const updated = await authService.updateProfile(form)
      setUser(updated)
      setMessage('Profile settings saved successfully.')
    } catch {
      setError('Unable to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof User }> = [
    { id: 'profile', label: 'Profile Details', icon: User },
    { id: 'social', label: 'Social Media Links', icon: Share2 },
    { id: 'account', label: 'Account Summary', icon: UserCheck },
    { id: 'security', label: 'Security & Scope', icon: ShieldCheck },
  ]

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
          <User className="h-3.5 w-3.5" />
          Workspace User Profile
        </div>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          {user?.role === 'Agency' ? 'Agency Profile' : 'Creator Profile'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">Manage profile bio, social channel handles, and workspace role scopes.</p>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((item) => {
          const Icon = item.icon
          const isActive = tab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-600">{error}</div>}

      {(tab === 'profile' || tab === 'social') && (
        <div className="ciq-card space-y-5">
          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="ciq-label">Full Name</label>
                  <input className="ciq-input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div>
                  <label className="ciq-label">Email Address (Read-only)</label>
                  <input className="ciq-input bg-slate-50 text-slate-500 cursor-not-allowed" value={user?.email || ''} disabled />
                </div>
              </div>
              <div>
                <label className="ciq-label">Creator Bio</label>
                <textarea
                  className="ciq-input min-h-28"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell brands and team members about your content style, audience demographics, and target platforms..."
                />
              </div>
              <div>
                <label className="ciq-label">Avatar Image URL</label>
                <input className="ciq-input" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://..." />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button type="submit" disabled={saving} className="ciq-btn-primary">
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {tab === 'social' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-extrabold text-slate-900">Platform Integrations</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Connect your social accounts securely via OAuth to enable automatic syncing.
                </p>
              </div>
              <SocialIntegrationManager />
            </div>
          )}
        </div>
      )}

      {tab === 'account' && (
        <div className="ciq-card space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900">Account Role & Status</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Role</p>
              <p className="mt-2 text-2xl font-extrabold text-brand-600">{user?.role}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Status</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-600 capitalize">{user?.status || 'Active'}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="ciq-card space-y-3 text-sm text-slate-600">
          <h3 className="text-lg font-extrabold text-slate-900">Workspace Security Overview</h3>
          <p>Your active session is protected with enterprise JWT authentication.</p>
          <p>Strict role-based access control (RBAC) governs data access policies across all analytics endpoints.</p>
        </div>
      )}
    </div>
  )
}
