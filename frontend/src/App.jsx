import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/layout/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ContentAnalytics from "./pages/ContentAnalytics";
import AudienceAnalytics from "./pages/AudienceAnalytics";
import GrowthTrends from "./pages/GrowthTrends";
import Revenue from "./pages/Revenue";
import Sponsorships from "./pages/Sponsorships";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route element={<Layout />}>

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/content"
            element={<ContentAnalytics />}
          />

          <Route
            path="/audience"
            element={<AudienceAnalytics />}
          />

          <Route
            path="/growth"
            element={<GrowthTrends />}
          />

          <Route
            path="/revenue"
            element={<Revenue />}
          />

          <Route
            path="/sponsorships"
            element={<Sponsorships />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;