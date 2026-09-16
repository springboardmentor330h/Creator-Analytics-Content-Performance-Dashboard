import Register from "./pages/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RoleGuard from "./routes/RoleGuard";
import AdminGuard from "./routes/AdminGuard";
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";

import ProfileSettings from "./pages/ProfileSettings";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ContentAnalytics from "./pages/ContentAnalytics";
import AudienceAnalytics from "./pages/AudienceAnalytics";
import GrowthTrends from "./pages/GrowthTrends";
import Revenue from "./pages/Revenue";
import Sponsorships from "./pages/Sponsorships";
import SocialMedia from "./pages/SocialMedia";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";

import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCreators from "./pages/admin/AdminCreators";
import AdminContent from "./pages/admin/AdminContent";
import AdminComparison from "./pages/admin/AdminComparison";
import AdminActivity from "./pages/admin/AdminActivity";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<RoleGuard />}>
            {/* Admin area — its own dedicated layout & sidebar, no creator nav */}
            <Route element={<AdminGuard />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="creators" element={<AdminCreators />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="comparison" element={<AdminComparison />} />
                <Route path="activity" element={<AdminActivity />} />
              </Route>
            </Route>

            {/* Creator / Agency / Marketing Team area */}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/content" element={<ContentAnalytics />} />
              <Route path="/audience" element={<AudienceAnalytics />} />
              <Route path="/growth" element={<GrowthTrends />} />
              <Route path="/revenue" element={<Revenue />} />
              <Route path="/sponsorships" element={<Sponsorships />} />
              <Route path="/social" element={<SocialMedia />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<ProfileSettings />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
