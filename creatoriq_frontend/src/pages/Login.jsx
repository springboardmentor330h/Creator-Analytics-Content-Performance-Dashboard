import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')

  const auth = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await auth.login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      const detail = err?.response?.data?.detail
      if (!err?.response) {
        setError('Cannot connect to server. Is the backend running on port 8000?')
      } else if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  const onForgot = (e) => {
    e.preventDefault()
    setForgotMsg('')
    if (!forgotEmail.trim()) {
      setForgotMsg('Please enter your registered email.')
      return
    }
    setForgotMsg(
      `If an account exists for ${forgotEmail.trim()}, contact your Administrator to reset the password, or sign in and use Settings → Change password.`
    )
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 text-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-bold">
            CIQ
          </div>
          <span className="font-semibold text-lg">CreatorIQ</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight mb-3">
            Creator analytics,
            <br />
            one professional dashboard.
          </h2>
          <p className="text-sky-100 text-sm max-w-md leading-relaxed">
            Track multi-platform performance, engagement, revenue, and reports —
            powered by your FastAPI backend and PostgreSQL data.
          </p>
        </div>
        <p className="text-xs text-sky-200/80">YouTube · Instagram · TikTok · Facebook · LinkedIn · X</p>
      </div>

      <div className="flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 space-y-5">
          {!forgotOpen ? (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
                <p className="text-sm text-slate-500 mt-1">Sign in to your CreatorIQ workspace</p>
              </div>

              {error && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
                  {error}
                </div>
              )}

              <div>
                <label className="ciq-label">Email</label>
                <input
                  className="ciq-input mt-1.5"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label className="ciq-label">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotOpen(true)
                      setForgotEmail(email)
                      setForgotMsg('')
                    }}
                    className="text-xs font-medium text-sky-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <input
                    className="ciq-input pr-14"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="ciq-btn-primary w-full disabled:opacity-60">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

              <p className="text-center text-sm text-slate-500">
                No account?{' '}
                <Link className="text-sky-600 font-medium hover:underline" to="/register">
                  Create one
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={onForgot} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Forgot password</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Enter your email. Reset is handled by an Administrator, or use Settings after you sign in.
                </p>
              </div>

              {forgotMsg && (
                <div className="text-sm text-slate-700 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5">
                  {forgotMsg}
                </div>
              )}

              <div>
                <label className="ciq-label">Registered email</label>
                <input
                  className="ciq-input mt-1.5"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="ciq-btn-primary w-full">
                Continue
              </button>

              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="w-full text-sm text-slate-500 hover:text-slate-800"
              >
                ← Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}