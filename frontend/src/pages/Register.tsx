import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, BarChart3, CheckCircle2, Eye, EyeOff, Lock, Mail, User, UserCheck, Building2, Megaphone, ShieldCheck } from 'lucide-react'
import AuthBrandPanel from '../components/AuthBrandPanel'
import { useAuth } from '../context/AuthContext'
import { PUBLIC_REGISTER_ROLES } from '../utils/roles'

const ROLE_ICONS: Record<string, typeof User> = {
  Creator: UserCheck,
  Agency: Building2,
  'Marketing Team': Megaphone,
  Administrator: ShieldCheck,
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  Creator: 'Individual content creators tracking performance & reach.',
  Agency: 'Manage & monitor multiple creator accounts & campaigns.',
  'Marketing Team': 'Brand managers reviewing content analytics & ROI.',
  Administrator: 'Full system access, user management & audit logs.',
}

export default function Register() {
  const { register, error } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('Creator')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // Password strength score 0 to 4
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }

  const strength = getPasswordStrength(password)
  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500']

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!fullName || !email || !password || !confirmPassword) {
      setFormError('Please complete all required fields.')
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
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }
    if (!acceptTerms) {
      setFormError('You must agree to the Terms & Conditions and Privacy Policy.')
      return
    }

    setFormError('')
    setLoading(true)
    try {
      await register(fullName, email, password, role, acceptTerms)
      // Redirect to login page after successful registration
      navigate('/login', {
        state: {
          registeredEmail: email,
          message: 'Account created successfully! Please log in with your credentials.',
        },
      })
    } catch {
      // AuthContext stores API error state
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AuthBrandPanel
        title="Join CreatorIQ Analytics Platform"
        subtitle="Select your role to access tailored analytics, cross-platform performance tracking, and role-based permissions."
      />

      <div className="flex w-full flex-col justify-center px-6 py-10 lg:w-[52%] lg:px-16 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg">
          <div className="flex items-center justify-between lg:hidden mb-6">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-brand-700">
              <BarChart3 className="h-6 w-6 text-brand-600" />
              <span>CreatorIQ</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
            <p className="mt-2 text-sm text-slate-500">
              Get started with real-time content performance & role-based analytics.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="ciq-label">Full Name</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="ciq-input pl-10"
                  placeholder="Alex Creator"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Role Selection Grid */}
            <div>
              <label className="ciq-label mb-2">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                {PUBLIC_REGISTER_ROLES.map((rOption) => {
                  const Icon = ROLE_ICONS[rOption] || UserCheck
                  const isSelected = role === rOption
                  return (
                    <button
                      key={rOption}
                      type="button"
                      onClick={() => setRole(rOption)}
                      className={`flex flex-col items-center justify-between rounded-xl border p-3 text-center transition-all duration-200 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="mt-2 text-xs font-bold">{rOption}</span>
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-xs text-slate-500 italic">
                {ROLE_DESCRIPTIONS[role] || 'Access custom metrics suited for your role.'}
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="ciq-label">Password</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
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

              {/* Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-100">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all duration-300 ${
                          step <= strength ? strengthColors[strength] : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-1 text-right text-[11px] font-semibold text-slate-500">
                    Strength: <span className="text-slate-700">{strengthLabels[strength]}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="ciq-label">Confirm Password</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="ciq-input pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 text-xs text-slate-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>
                I agree to the <span className="font-semibold text-brand-700 hover:underline">Terms of Service</span> and{' '}
                <span className="font-semibold text-brand-700 hover:underline">Privacy Policy</span>.
              </span>
            </label>

            {/* Errors */}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
