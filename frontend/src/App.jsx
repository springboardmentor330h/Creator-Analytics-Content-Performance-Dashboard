import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="audience" element={<AudiencePage />} />
          <Route path="growth" element={<GrowthPage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="sponsorships" element={<SponsorshipsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}