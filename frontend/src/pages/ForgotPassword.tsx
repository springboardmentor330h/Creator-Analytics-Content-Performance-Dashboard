import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Mail } from 'lucide-react'
import AuthBrandPanel from '../components/AuthBrandPanel'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const response = await api.post('/auth/forgot-password', { email })
      setMessage(response.data.message || 'Password reset link sent to your email address.')
    } catch {
      setError('Unable to process password reset for that email address.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AuthBrandPanel title="Reset your CreatorIQ password" subtitle="Enter your registered email address to receive password recovery instructions." />

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[52%] lg:px-16 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between lg:hidden mb-6">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-brand-700">
              <BarChart3 className="h-6 w-6 text-brand-600" />
              <span>CreatorIQ</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot Password</h2>
            <p className="mt-2 text-sm text-slate-500">
              We&apos;ll send you instructions to safely reset your password.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="ciq-label">Email Address</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  className="ciq-input pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {message && (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="ciq-btn-primary w-full">
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-200 pt-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand-600">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
