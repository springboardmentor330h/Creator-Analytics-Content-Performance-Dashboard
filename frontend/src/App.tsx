import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AccountSettings from './pages/AccountSettings'
import AgencyManagement from './pages/AgencyManagement'
import ContentAnalytics from './pages/ContentAnalytics'
import ContentComparison from './pages/ContentComparison'
import ContentDetails from './pages/ContentDetails'
import Dashboard from './pages/Dashboard'
import Forbidden from './pages/Forbidden'
import ForgotPassword from './pages/ForgotPassword'
import Landing from './pages/Landing'
import Login from './pages/Login'
import MyContent from './pages/MyContent'
import Profile from './pages/Profile'
import Register from './pages/Register'
import SocialConnections from './pages/SocialConnections'
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

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/content-analytics" element={<ContentAnalytics />} />
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
          <Route
            path="/agency"
            element={
              <RoleProtectedRoute roles={[ROLES.AGENCY, ROLES.ADMIN]}>
                <AgencyManagement />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/social-connections"
            element={
              <RoleProtectedRoute roles={[ROLES.CREATOR, ROLES.AGENCY, ROLES.ADMIN]}>
                <SocialConnections />
              </RoleProtectedRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<AccountSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
