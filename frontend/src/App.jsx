import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ContentAnalytics from "./pages/ContentAnalytics";
import AudienceAnalytics from "./pages/AudienceAnalytics";
import GrowthTrends from "./pages/GrowthTrends";
import Revenue from "./pages/Revenue";
import Sponsorships from "./pages/Sponsorships";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import ProfileSettings from "./pages/ProfileSettings";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/content-analytics"
            element={
              <PrivateRoute>
                <ContentAnalytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/audience-analytics"
            element={
              <PrivateRoute>
                <AudienceAnalytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/growth-trends"
            element={
              <PrivateRoute>
                <GrowthTrends />
              </PrivateRoute>
            }
          />
          <Route
            path="/revenue"
            element={
              <PrivateRoute>
                <Revenue />
              </PrivateRoute>
            }
          />
          <Route
            path="/sponsorships"
            element={
              <PrivateRoute>
                <Sponsorships />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfileSettings />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}