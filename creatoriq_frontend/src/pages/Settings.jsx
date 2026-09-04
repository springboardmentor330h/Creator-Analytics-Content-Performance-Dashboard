import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { changePasswordRequest } from '../services/api'

export default function Settings() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChangePassword = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    setLoading(true)
    try {
      await changePasswordRequest(currentPassword, newPassword)
      setMsg('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : 'Failed to update password. Check POST /auth/change-password on the backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Profile and password</p>
      </div>

      {/* Profile */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-sm shadow-sm">
        <h2 className="font-semibold text-slate-900">Profile</h2>
        <div>
          <p className="text-slate-500 text-xs">Name</p>
          <p className="font-medium text-slate-900">{user?.full_name || '—'}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Email</p>
          <p className="font-medium text-slate-900">{user?.email || '—'}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Role</p>
          <p className="font-medium capitalize text-slate-900">{user?.role || '—'}</p>
        </div>
      </div>

      {/* Change password */}
      <form
        onSubmit={onChangePassword}
        className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm"
      >
        <h2 className="font-semibold text-slate-900">Change password</h2>
        <p className="text-xs text-slate-500">
          Updates the hashed password in the users table.
        </p>

        {msg && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            {msg}
          </div>
        )}
        {error && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-500">Current password</label>
          <div className="relative mt-1">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-14 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              {showCurrent ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500">New password</label>
          <div className="relative mt-1">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-14 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              {showNew ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}