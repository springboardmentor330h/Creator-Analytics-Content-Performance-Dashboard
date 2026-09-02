import { Routes, Route } from "react-router";

import DashboardLayout from "./components/layout/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import ContentAnalytics from "./pages/ContentAnalytics";
import AudienceAnalytics from "./pages/AudienceAnalytics";
import GrowthTrends from "./pages/GrowthTrends";
import Revenue from "./pages/Revenue";
import Sponsorships from "./pages/Sponsorships";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/content" element={<ContentAnalytics />} />
        <Route path="/audience" element={<AudienceAnalytics />} />
        <Route path="/growth" element={<GrowthTrends />} />
        <Route path="/growth/:creatorId" element={<GrowthTrends />}/>
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/sponsorships" element={<Sponsorships />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;