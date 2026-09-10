import Register from "./pages/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RoleGuard from "./routes/RoleGuard";
import Layout from "./components/Layout";


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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<RoleGuard />}>
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
