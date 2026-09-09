import axios from 'axios'
import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService, { ProfileResponse } from '../services/authService'
import { getSafeRedirectUrl } from '../utils/redirect'

interface AuthContextValue {
  user: ProfileResponse | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string, redirectTo?: string) => Promise<void>
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
    if (!err.response) {
      return 'Unable to connect to the server. Please check your backend connection.'
    }
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
    let isMounted = true
    const initialize = async () => {
      const storedToken = localStorage.getItem('creatoriq_token')
      if (storedToken) {
        try {
          authService.setToken(storedToken)
          const profile = await authService.profile()
          if (isMounted) {
            setUser(profile)
            setToken(storedToken)
          }
        } catch {
          if (isMounted) {
            setToken(null)
            localStorage.removeItem('creatoriq_token')
            authService.clearToken()
            setUser(null)
          }
        }
      } else {
        if (isMounted) {
          setUser(null)
          setToken(null)
        }
      }
      if (isMounted) {
        setLoading(false)
      }
    }
    initialize()
    return () => {
      isMounted = false
    }
  }, [])

  const login = async (email: string, password: string, redirectTo?: string) => {
    setError(null)
    try {
      const response = await authService.login(email, password)
      const accessToken = response.access_token
      setToken(accessToken)
      localStorage.setItem('creatoriq_token', accessToken)
      authService.setToken(accessToken)
      const profile = await authService.profile()
      setUser(profile)
      const destination = getSafeRedirectUrl(redirectTo, '/dashboard')
      navigate(destination, { replace: true })
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
    navigate('/login', { replace: true })
  }

  const fetchProfile = async () => {
    const currentToken = localStorage.getItem('creatoriq_token')
    if (!currentToken) return
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
