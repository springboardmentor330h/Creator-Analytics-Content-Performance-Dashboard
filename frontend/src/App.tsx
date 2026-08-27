import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AccountSettings from './pages/AccountSettings'
import AgencyManagement from './pages/AgencyManagement'
import AudienceAnalytics from './pages/AudienceAnalytics'
import ContentAnalytics from './pages/ContentAnalytics'
import ContentComparison from './pages/ContentComparison'
import ContentDetails from './pages/ContentDetails'
import Dashboard from './pages/Dashboard'
import Forbidden from './pages/Forbidden'
import ForgotPassword from './pages/ForgotPassword'
import GrowthTrends from './pages/GrowthTrends'
import Landing from './pages/Landing'
import Login from './pages/Login'
import MyContent from './pages/MyContent'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Reports from './pages/Reports'
import Revenue from './pages/Revenue'
import SocialConnections from './pages/SocialConnections'
import Sponsorships from './pages/Sponsorships'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleProtectedRoute from './routes/RoleProtectedRoute'
import { ROLES } from './utils/roles'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/403" element={<Forbidden />} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Analytics */}
          <Route path="/content-analytics" element={<ContentAnalytics />} />
          <Route path="/audience-analytics" element={<AudienceAnalytics />} />
          <Route path="/growth-trends" element={<GrowthTrends />} />
          <Route path="/growth" element={<GrowthTrends />} />

          {/* Revenue & Sponsorships */}
          <Route
            path="/revenue"
            element={
              <RoleProtectedRoute roles={[ROLES.CREATOR, ROLES.AGENCY, ROLES.ADMIN]}>
                <Revenue />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/sponsorships"
            element={
              <RoleProtectedRoute roles={[ROLES.CREATOR, ROLES.AGENCY, ROLES.ADMIN]}>
                <Sponsorships />
              </RoleProtectedRoute>
            }
          />

          {/* Notifications & Reports */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />

          {/* Content */}
          <Route
            path="/content"
            element={
              <RoleProtectedRoute roles={[ROLES.CREATOR, ROLES.ADMIN]}>
                <MyContent />
              </RoleProtectedRoute>
            }
          />
          <Route path="/content/:id" element={<ContentDetails />} />
          <Route
            path="/content-compare"
            element={
              <RoleProtectedRoute roles={[ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN]}>
                <ContentComparison />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/content-comparison"
            element={
              <RoleProtectedRoute roles={[ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN]}>
                <ContentComparison />
              </RoleProtectedRoute>
            }
          />

          {/* Agency */}
          <Route
            path="/agency"
            element={
              <RoleProtectedRoute roles={[ROLES.AGENCY, ROLES.ADMIN]}>
                <AgencyManagement />
              </RoleProtectedRoute>
            }
          />

          {/* Social */}
          <Route
            path="/social-connections"
            element={
              <RoleProtectedRoute roles={[ROLES.CREATOR, ROLES.AGENCY, ROLES.ADMIN]}>
                <SocialConnections />
              </RoleProtectedRoute>
            }
          />

          {/* Profile & Settings */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<AccountSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
