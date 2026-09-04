import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { loginRequest, registerRequest } from '../services/api'

const AuthContext = createContext(null)

async function fetchMe() {
  try {
    const res = await api.get('/users/me')
    return res.data
  } catch {
    try {
      const res = await api.get('/auth/me')
      return res.data
    } catch {
      return null
    }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function init() {
      if (!token) {
        if (!cancelled) setLoading(false)
        return
      }
      const me = await fetchMe()
      if (cancelled) return
      if (me) setUser(me)
      else {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
      setLoading(false)
    }
    init()
    return () => {
      cancelled = true
    }
  }, [token])

  const login = async (email, password) => {
    const data = await loginRequest(email, password)
    const access = data.access_token
    localStorage.setItem('token', access)
    setToken(access)
    const me = await fetchMe()
    const profile = me || { email }
    setUser(profile)
    return profile
  }

  const register = async (payload) => {
    await registerRequest(payload)
    return login(payload.email, payload.password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!token,
    }),
    [user, loading, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
