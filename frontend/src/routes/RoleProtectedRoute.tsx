import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface RoleProtectedRouteProps {
  roles: string[]
  children: React.ReactNode
}

export default function RoleProtectedRoute({ roles, children }: RoleProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnUrl=${returnUrl}`} state={{ from: location }} replace />
  }

  const userRole = user.role?.toLowerCase() || ''
  const hasRole = roles.some((r) => r.toLowerCase() === userRole)

  if (!hasRole) {
    return <Navigate to="/403" replace />
  }

  return children
}
