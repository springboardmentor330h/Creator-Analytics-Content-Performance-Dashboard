/**
 * Auth state, shared across the whole app via React Context.
 *
 * WHY context instead of passing props down?
 * "Is the user logged in / who are they" is needed in many unrelated
 * places (Sidebar, ProtectedRoute, Dashboard...). Context lets any
 * component read it directly with useAuth(), instead of threading
 * props through every layer of the component tree.
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi, getMyProfile } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On first load, if a token exists, try to fetch the profile
    // so a page refresh doesn't log the user out.
    const token = localStorage.getItem('creatoriq_token')
    if (!token) {
      setLoading(false)
      return
    }
    getMyProfile()
      .then(setUser)
      .catch(() => localStorage.removeItem('creatoriq_token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await loginApi(email, password)
    localStorage.setItem('creatoriq_token', data.access_token)
    const profile = await getMyProfile()
    setUser(profile)
    return profile
  }

  function logout() {
    localStorage.removeItem('creatoriq_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
