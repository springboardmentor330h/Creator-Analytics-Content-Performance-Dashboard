import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import ContentPage from './pages/ContentPage';
import AudiencePage from './pages/AudiencePage';
import GrowthPage from './pages/GrowthPage';
import RevenuePage from './pages/RevenuePage';
import SponsorshipsPage from './pages/SponsorshipsPage';
import NotificationsPage from './pages/NotificationsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user session", e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = String(user?.role || '').toLowerCase().includes('admin');

  if (loading) {
    return null; // Prevents flash of login screen during session hydration
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            !user ? (
              <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate to={isAdmin ? '/admin' : '/'} replace />
            )
          }
        />

        {isAdmin && (
          <Route path="/admin" element={<DashboardLayout user={user} onLogout={handleLogout} />}>
            <Route index element={<AdminDashboardPage user={user} />} />
            <Route path="users" element={<AdminDashboardPage user={user} />} />
            <Route path="profile" element={<ProfilePage user={user} />} />
          </Route>
        )}

        {!isAdmin && (
          <Route
            path="/"
            element={
              user ? (
                <DashboardLayout user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<DashboardOverview user={user} />} />
            <Route path="content" element={<ContentPage user={user} />} />
            <Route path="audience" element={<AudiencePage user={user} />} />
            <Route path="growth" element={<GrowthPage user={user} />} />
            <Route path="revenue" element={<RevenuePage user={user} />} />
            <Route path="sponsorships" element={<SponsorshipsPage user={user} />} />
            <Route path="notifications" element={<NotificationsPage user={user} />} />
            <Route path="reports" element={<ReportsPage user={user} />} />
            <Route path="profile" element={<ProfilePage user={user} />} />
          </Route>
        )}

        <Route path="*" element={<Navigate to={isAdmin ? '/admin' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}