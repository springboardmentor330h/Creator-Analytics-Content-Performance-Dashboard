import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (!err.response) {
        setError('Cannot connect to server. Please try again later.')
      } else if (typeof detail === 'string') {
        setError(detail)
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg || JSON.stringify(d)).join(', '))
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="text-center mb-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 items-center justify-center font-bold mb-3">
            CIQ
          </div>
          <h1 className="text-xl font-bold">Sign in to CreatorIQ</h1>
          <p className="text-sm text-slate-400">Creator analytics dashboard</p>
        </div>
        {error && (
          <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div>
          <label className="text-sm text-slate-400">Email</label>
          <input
            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm text-slate-400">Password</label>
          <input
            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded-lg py-2.5 font-medium"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-slate-500">
          No account? <Link className="text-sky-400" to="/register">Register</Link>
        </p>
      </form>
    </div>
  )
}
