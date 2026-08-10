import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface RoleProtectedRouteProps {
  roles: string[]
  children: React.ReactNode
}

export default function RoleProtectedRoute({ roles, children }: RoleProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return children
}
