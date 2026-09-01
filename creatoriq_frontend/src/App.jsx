import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Content from './pages/Content'
import Audience from './pages/Audience'
import Growth from './pages/Growth'
import PlatformComparison from './pages/PlatformComparison'
import SocialSync from './pages/SocialSync'
import Revenue from './pages/Revenue'
import Sponsorships from './pages/Sponsorships'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Loading from './components/ui/Loading'

function Private({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Loading label="Loading..." />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Loading label="Loading..." />
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/" element={<Private><Layout /></Private>}>
        <Route index element={<Dashboard />} />
        <Route path="content" element={<Content />} />
        <Route path="audience" element={<Audience />} />
        <Route path="growth" element={<Growth />} />
        <Route path="platform-comparison" element={<PlatformComparison />} />
        <Route path="social" element={<SocialSync />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="sponsorships" element={<Sponsorships />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
