import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, Lock, ShieldCheck, User, Globe, Share2, Sparkles, UserCheck, AlertCircle } from 'lucide-react'
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
      setMessage('Profile updated successfully.')
    } catch {
      setError('Unable to save profile changes.')
    } finally {
      setSaving(false)
    }
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof User }> = [
    { id: 'profile', label: 'Profile Details', icon: User },
    { id: 'social', label: 'Connected Apps', icon: Share2 },
    { id: 'account', label: 'Account Scope', icon: UserCheck },
    { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
          <User className="h-3.5 w-3.5" />
          Workspace User Profile
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {user?.role === 'Agency' ? 'Agency Workspace Profile' : 'Creator Profile'}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Manage profile bio, social channel integrations, and workspace scopes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-3">
        {tabs.map((item) => {
          const Icon = item.icon
          const isActive = tab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab: Profile Details */}
      {tab === 'profile' && (
        <div className="ciq-card max-w-3xl">
          <form onSubmit={saveProfile} className="space-y-5 text-xs">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="ciq-label">Full Name</label>
                <input
                  className="ciq-input text-xs"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="ciq-label">Email Address (Read-only)</label>
                <input
                  className="ciq-input text-xs bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
                  value={user?.email || ''}
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="ciq-label">Creator Bio</label>
              <textarea
                className="ciq-input text-xs min-h-24 resize-y"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Content niche, audience demographics, target brands..."
              />
            </div>

            <div>
              <label className="ciq-label">Avatar Image URL</label>
              <input
                className="ciq-input text-xs"
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button type="submit" disabled={saving} className="ciq-btn-primary">
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Connected Apps */}
      {tab === 'social' && (
        <div className="space-y-4">
          <div className="ciq-card p-4 sm:p-5">
            <h3 className="text-base font-extrabold text-slate-900">Connected Platform Integrations</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Manage live connections, perform manual syncs, and review channel authorization metadata.
            </p>
          </div>
          <SocialIntegrationManager />
        </div>
      )}

      {/* Tab: Account Scope */}
      {tab === 'account' && (
        <div className="ciq-card max-w-2xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Account Role & Workspace Scope</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Role</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{user?.role}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Account Status</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-600 capitalize">
                {user?.status || 'Active'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security */}
      {tab === 'security' && (
        <div className="ciq-card max-w-2xl space-y-3 text-xs text-slate-600">
          <h3 className="text-base font-extrabold text-slate-900">Workspace Security Overview</h3>
          <p className="leading-relaxed">
            Your active session is protected with enterprise JWT bearer authentication. Token credentials are verified against secure RBAC tables on each API transaction.
          </p>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Password & Credentials</span>
            <a href="/settings" className="font-bold text-indigo-600 hover:text-indigo-800">
              Update in Account Settings →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
