import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ContentAnalytics from './pages/ContentAnalytics'
import AudienceAnalytics from './pages/AudienceAnalytics'
import GrowthTrends from './pages/GrowthTrends'
import PlatformComparison from './pages/PlatformComparison'
import RevenueDashboard from './pages/RevenueDashboard'
import Sponsorships from './pages/Sponsorships'
import NotificationsPage from './pages/Notifications'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/content"
            element={
              <ProtectedRoute>
                <ContentAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/audience"
            element={
              <ProtectedRoute>
                <AudienceAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/platforms"
            element={
              <ProtectedRoute>
                <PlatformComparison />
              </ProtectedRoute>
            }
          />
          <Route
            path="/growth-trends"
            element={
              <ProtectedRoute>
                <GrowthTrends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revenue"
            element={
              <ProtectedRoute>
                <RevenueDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sponsorships"
            element={
              <ProtectedRoute>
                <Sponsorships />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
