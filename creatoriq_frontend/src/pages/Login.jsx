import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
      if (!err?.response) setError('Cannot connect to server. Is the backend on port 8000?')
      else if (typeof detail === 'string') setError(detail)
      else if (Array.isArray(detail)) setError(detail.map((d) => d.msg || JSON.stringify(d)).join(', '))
      else setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: '#f8fafc',
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div
            style={{
              display: 'inline-flex',
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
              color: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            CIQ
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Sign in to CreatorIQ
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
            Creator analytics dashboard
          </p>
        </div>

        {error ? (
          <div
            style={{
              fontSize: 14,
              color: '#b91c1c',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        ) : null}

        <label style={{ fontSize: 14, color: '#475569', display: 'block' }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            marginTop: 4,
            marginBottom: 12,
            width: '100%',
            boxSizing: 'border-box',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '10px 12px',
            fontSize: 14,
          }}
        />

        <label style={{ fontSize: 14, color: '#475569', display: 'block' }}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            marginTop: 4,
            marginBottom: 16,
            width: '100%',
            boxSizing: 'border-box',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '10px 12px',
            fontSize: 14,
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#7dd3fc' : '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '10px 12px',
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 16 }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#0284c7' }}>
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}
