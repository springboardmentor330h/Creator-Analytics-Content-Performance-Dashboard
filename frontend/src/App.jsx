import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "./context/RoleContext";
import RoleGuard from "./routes/RoleGuard";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ContentAnalytics from "./pages/ContentAnalytics";
import AudienceAnalytics from "./pages/AudienceAnalytics";   // NEW
import GrowthTrends from "./pages/GrowthTrends";              // NEW

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<RoleGuard><Dashboard /></RoleGuard>} />
          <Route path="/content-analytics" element={<RoleGuard><ContentAnalytics /></RoleGuard>} />
          <Route path="/audience-analytics" element={<RoleGuard><AudienceAnalytics /></RoleGuard>} />
          <Route path="/growth-trends" element={<RoleGuard><GrowthTrends /></RoleGuard>} />
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}