import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { changePasswordRequest, updateProfileRequest } from '../services/api'

const inputClass =
  'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40 caret-slate-900 dark:caret-slate-100'

export default function Settings() {
  const { user, setUser, refreshUser } = useAuth()

  // Profile form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '')
      setEmail(user.email || '')
    }
  }, [user])

  const onUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileMsg('')
    setProfileError('')

    const name = fullName.trim()
    const mail = email.trim()

    if (!name || name.length < 2) {
      setProfileError('Name must be at least 2 characters.')
      return
    }
    if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setProfileError('Please enter a valid email address.')
      return
    }
    if (!user?.id) {
      setProfileError('User id not available. Try signing out and back in.')
      return
    }

    setProfileLoading(true)
    try {
      const res = await updateProfileRequest(user.id, {
        full_name: name,
        email: mail,
      })
      const updated = res?.data || res
      // Prefer server payload, fall back to local merge
      const next = {
        ...user,
        full_name: updated?.full_name ?? name,
        email: updated?.email ?? mail,
        role: updated?.role ?? user.role,
        id: updated?.id ?? user.id,
      }
      setUser?.(next)
      try {
        await refreshUser?.()
      } catch {
        /* ignore refresh errors; local state already updated */
      }
      setProfileMsg('Profile updated successfully.')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setProfileError(detail.map((d) => d.msg || JSON.stringify(d)).join('; '))
      } else if (typeof detail === 'string') {
        setProfileError(detail)
      } else {
        setProfileError('Failed to update profile. Check PUT /users/{id} on the backend.')
      }
    } finally {
      setProfileLoading(false)
    }
  }

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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Profile and password</p>
      </div>

      {/* Editable profile — PROFILE-02 / PROFILE-03 / PROFILE-05 / PROFILE-06 */}
      <form
        onSubmit={onUpdateProfile}
        className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm dark:bg-slate-900 dark:border-slate-800"
      >
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Profile</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update your display name and email. Changes are saved to PostgreSQL.
          </p>
        </div>

        {profileMsg && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900">
            {profileMsg}
          </div>
        )}
        {profileError && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-900">
            {profileError}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
            className={`${inputClass} mt-1`}
            autoComplete="name"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`${inputClass} mt-1`}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Role</label>
          <p className="mt-1 text-sm font-medium capitalize text-slate-900 dark:text-slate-100">
            {user?.role || '—'}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Role can only be changed by an Administrator.
          </p>
        </div>

        <button
          type="submit"
          disabled={profileLoading}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium disabled:opacity-50"
        >
          {profileLoading ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      {/* Change password */}
      <form
        onSubmit={onChangePassword}
        className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm dark:bg-slate-900 dark:border-slate-800"
      >
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Change password</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Updates the hashed password in the users table.
        </p>

        {msg && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900">
            {msg}
          </div>
        )}
        {error && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-900">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Current password</label>
          <div className="relative mt-1">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className={`${inputClass} pr-14`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {showCurrent ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">New password</label>
          <div className="relative mt-1">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className={`${inputClass} pr-14`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
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
