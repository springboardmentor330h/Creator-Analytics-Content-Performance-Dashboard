import axios from 'axios'
import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService, { ProfileResponse } from '../services/authService'

interface AuthContextValue {
  user: ProfileResponse | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (
    full_name: string,
    email: string,
    password: string,
    role: string,
    accept_terms: boolean
  ) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  setUser: (user: ProfileResponse | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
    return err.response?.data?.message || fallback
  }
  return fallback
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ProfileResponse | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('creatoriq_token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const initialize = async () => {
      if (token) {
        try {
          authService.setToken(token)
          const profile = await authService.profile()
          setUser(profile)
        } catch {
          setToken(null)
          localStorage.removeItem('creatoriq_token')
          setUser(null)
        }
      }
      setLoading(false)
    }
    initialize()
  }, [token])

  const login = async (email: string, password: string) => {
    setError(null)
    try {
      const response = await authService.login(email, password)
      setToken(response.access_token)
      localStorage.setItem('creatoriq_token', response.access_token)
      authService.setToken(response.access_token)
      const profile = await authService.profile()
      setUser(profile)
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to login. Check credentials.'))
      throw err
    }
  }

  const register = async (
    full_name: string,
    email: string,
    password: string,
    role: string,
    accept_terms: boolean
  ) => {
    setError(null)
    try {
      await authService.register(full_name, email, password, role, accept_terms)
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to register. Email may already exist.'))
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('creatoriq_token')
    authService.clearToken()
    navigate('/login')
  }

  const fetchProfile = async () => {
    if (!token) return
    try {
      const profile = await authService.profile()
      setUser(profile)
    } catch {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, register, logout, fetchProfile, setUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
