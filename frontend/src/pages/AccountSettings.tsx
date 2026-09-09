import { FormEvent, useState } from 'react'
import { CheckCircle2, Lock, Mail, Settings, ShieldCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'

export default function AccountSettings() {
  const { user, setUser } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const updated = await authService.updateAccountSettings({
        email: email !== user?.email ? email : undefined,
        current_password: newPassword ? currentPassword : undefined,
        new_password: newPassword || undefined,
      })
      setUser(updated)
      setCurrentPassword('')
      setNewPassword('')
      setMessage('Account settings updated successfully.')
    } catch (err: unknown) {
      const detail =
        typeof err === 'object' && err && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      setError(detail || 'Unable to update account settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
          <Settings className="h-3.5 w-3.5" />
          Security & Credentials
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Account Settings
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Update account email address, modify sign-in password credentials, and inspect subscription plan tier.
        </p>
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

      {/* Account Settings Form */}
      <form onSubmit={handleSubmit} className="ciq-card max-w-2xl space-y-4 text-xs">
        <h3 className="text-base font-extrabold tracking-tight text-slate-900">Update Credentials</h3>

        <div>
          <label className="ciq-label">Email Address</label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              className="ciq-input text-xs pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="ciq-label">Current Password</label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              className="ciq-input text-xs pl-9"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="ciq-label">New Password</label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              className="ciq-input text-xs pl-9"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button type="submit" disabled={saving} className="ciq-btn-primary">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Workspace Plan Tiers */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Workspace Plan Tier
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              name: 'Starter Creator',
              price: '$0',
              badge: 'Free Tier',
              features: ['Single creator account', '30-day metrics history', 'Core engagement tracking'],
              current: user?.role === 'Creator',
            },
            {
              name: 'Agency Pro',
              price: '$19',
              badge: 'Popular',
              features: ['5 creator accounts', '1-year metrics history', 'Side-by-side comparison tools', 'Priority sync'],
              current: user?.role === 'Agency',
            },
            {
              name: 'Enterprise Scale',
              price: '$49',
              badge: 'Full Access',
              features: ['Unlimited accounts', 'Strict RBAC permissions', 'Custom exports & API access', '24/7 dedicated support'],
              current: user?.role === 'Administrator',
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`ciq-card relative flex flex-col justify-between ${
                plan.current ? 'border-indigo-500 ring-2 ring-indigo-500/10' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">{plan.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {plan.badge}
                  </span>
                </div>
                <p className="mt-3 text-3xl font-extrabold text-slate-900">
                  {plan.price} <span className="text-xs font-normal text-slate-400">/ mo</span>
                </p>
                <ul className="mt-4 space-y-2 text-xs font-medium text-slate-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100">
                <span
                  className={`text-xs font-bold block text-center py-1.5 rounded-xl ${
                    plan.current
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-slate-400'
                  }`}
                >
                  {plan.current ? 'Current Plan Active' : 'Available on Upgrade'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
