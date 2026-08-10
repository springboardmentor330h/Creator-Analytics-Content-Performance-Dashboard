import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AlertCircle, ArrowRight, BarChart3, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import AuthBrandPanel from '../components/AuthBrandPanel'
import { useAuth } from '../context/AuthContext'

interface LocationState {
  registeredEmail?: string
  message?: string
}

export default function Login() {
  const { login, error } = useAuth()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (state?.registeredEmail) {
      setEmail(state.registeredEmail)
    }
    if (state?.message) {
      setSuccessMessage(state.message)
    }
  }, [state])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !password) {
      setFormError('Email and password are required.')
      return
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    if (password.length > 72) {
      setFormError('Password cannot exceed 72 characters.')
      return
    }

    setFormError('')
    setSuccessMessage('')
    setLoading(true)
    try {
      await login(email, password)
    } catch {
      // AuthContext stores API error state
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AuthBrandPanel title="Welcome Back to CreatorIQ" subtitle="Access your workspace, live performance metrics, and content reports." />

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[52%] lg:px-16 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between lg:hidden mb-6">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-brand-700">
              <BarChart3 className="h-6 w-6 text-brand-600" />
              <span>CreatorIQ</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign In</h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your email and password to access your CreatorIQ analytics dashboard.
            </p>
          </div>

          {/* Success Banner (e.g. redirected after registration) */}
          {successMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm animate-pulse-slow">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">Registration Successful!</p>
                <p className="mt-0.5 text-xs text-emerald-700">{successMessage}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Address */}
            <div>
              <label className="ciq-label">Email Address</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ciq-input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="ciq-label">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ciq-input pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {(formError || error) && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError || error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="ciq-btn-primary w-full">
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
