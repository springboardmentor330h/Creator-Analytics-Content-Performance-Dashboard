// src/App.jsx
import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  NavLink, 
  Navigate, 
  useNavigate 
} from 'react-router-dom';
import { LayoutDashboard, FolderKanban, User, LogOut } from 'lucide-react';

import DashboardOverview from './pages/DashboardOverview.jsx';
import ContentManager from './pages/ContentManager.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx'; // Assume your login form component is imported here

// Protected Layout Frame
function DashboardLayout({ children, onLogout }) {
  return (
    <div style={styles.appWrapper}>
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logoBadge}>A</div>
          <span style={styles.brandTitle}>Analytics Hub</span>
        </div>

        <nav style={styles.navGroup}>
          <NavLink 
            to="/dashboard" 
            style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navActive : {}) })}
          >
            <LayoutDashboard size={18} />
            Overview
          </NavLink>

          <NavLink 
            to="/content" 
            style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navActive : {}) })}
          >
            <FolderKanban size={18} />
            Content Manager
          </NavLink>

          <NavLink 
            to="/profile" 
            style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navActive : {}) })}
          >
            <User size={18} />
            Profile
          </NavLink>
        </nav>

        <button onClick={onLogout} style={styles.sidebarLogout}>
          <LogOut size={18} />
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

// Route Guard Component
function ProtectedRoute({ isAuthenticated, children, onLogout }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout onLogout={onLogout}>{children}</DashboardLayout>;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('token')
  );

  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        {/* Protected Application Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <DashboardOverview />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/content" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <ContentManager />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <Profile onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

const styles = {
  appWrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRight: '1px solid #1e293b',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0 0.5rem 1.5rem 0.5rem',
    borderBottom: '1px solid #1e293b',
  },
  logoBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#f8fafc',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1.5rem',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.875rem',
    borderRadius: '6px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.15s ease',
  },
  navActive: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    fontWeight: '600',
  },
  sidebarLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.875rem',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  mainContent: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
};