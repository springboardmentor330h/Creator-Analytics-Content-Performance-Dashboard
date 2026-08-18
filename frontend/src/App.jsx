import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "./context/RoleContext";
import { CreatorProvider } from "./context/CreatorContext";
import RoleGuard from "./routes/RoleGuard";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ContentAnalytics from "./pages/ContentAnalytics";
import AudienceAnalytics from "./pages/AudienceAnalytics";
import GrowthTrends from "./pages/GrowthTrends";
import PlatformComparison from "./pages/PlatformComparison";
import SocialMedia from "./pages/SocialMedia";
import Revenue from "./pages/Revenue";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <RoleProvider>
      <CreatorProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<RoleGuard><Dashboard /></RoleGuard>} />
            <Route path="/content-analytics" element={<RoleGuard><ContentAnalytics /></RoleGuard>} />
            <Route path="/audience-analytics" element={<RoleGuard><AudienceAnalytics /></RoleGuard>} />
            <Route path="/growth-trends" element={<RoleGuard><GrowthTrends /></RoleGuard>} />
            <Route path="/platform-comparison" element={<RoleGuard><PlatformComparison /></RoleGuard>} />
            <Route path="/social-media" element={<RoleGuard><SocialMedia /></RoleGuard>} />
            <Route path="/revenue" element={<RoleGuard><Revenue /></RoleGuard>} />
            <Route path="/notifications" element={<RoleGuard><Notifications /></RoleGuard>} />
            <Route path="/reports" element={<RoleGuard><Reports /></RoleGuard>} />
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </CreatorProvider>
    </RoleProvider>
  );
}