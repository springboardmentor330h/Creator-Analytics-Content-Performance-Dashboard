import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ContentAnalytics from './pages/ContentAnalytics'
import AudienceAnalytics from './pages/AudienceAnalytics'
import PlatformComparison from './pages/PlatformComparison'
import RevenueDashboard from './pages/RevenueDashboard'
import Reports from './pages/Reports'
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
            path="/revenue"
            element={
              <ProtectedRoute>
                <RevenueDashboard />
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
