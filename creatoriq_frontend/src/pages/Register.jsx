import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'creator',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      const d = err.response?.data?.detail
      setError(typeof d === 'string' ? d : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
        <h1 className="text-xl font-bold text-center">Create account</h1>
        {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
        {['full_name', 'email', 'password'].map((k) => (
          <div key={k}>
            <label className="text-sm text-slate-500 capitalize">{k.replace('_', ' ')}</label>
            <input
              className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              type={k === 'password' ? 'password' : k === 'email' ? 'email' : 'text'}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              required
              minLength={k === 'password' ? 8 : undefined}
            />
          </div>
        ))}
        <div>
          <label className="text-sm text-slate-500">Role</label>
          <select className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="creator">Creator</option>
            <option value="agency">Agency</option>
            <option value="marketing">Marketing</option>
            <option value="user">User</option>
          </select>
        </div>
        <button disabled={loading} className="w-full bg-sky-600 text-white hover:bg-sky-500 rounded-lg py-2.5 font-medium disabled:opacity-50">
          {loading ? 'Creating...' : 'Create account'}
        </button>
        <p className="text-center text-sm text-slate-500">
          Have an account? <Link className="text-sky-600" to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
