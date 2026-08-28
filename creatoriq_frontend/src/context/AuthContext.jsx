import { createContext, useContext, useEffect, useState } from 'react'
import api, { loginRequest, registerRequest } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    // Prefer /users/me if available; fallback to decoding nothing and keeping token session
    api
      .get('/users/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        // Some projects expose profile under different paths
        api
          .get('/auth/me')
          .then((res) => setUser(res.data))
          .catch(() => localStorage.removeItem('token'))
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await loginRequest(email, password)
    localStorage.setItem('token', data.access_token)
    try {
      const me = await api.get('/users/me')
      setUser(me.data)
      return me.data
    } catch {
      try {
        const me = await api.get('/auth/me')
        setUser(me.data)
        return me.data
      } catch {
        setUser({ email })
        return { email }
      }
    }
  }

  const register = async (payload) => {
    await registerRequest(payload)
    return login(payload.email, payload.password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated: !!localStorage.getItem('token') }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
