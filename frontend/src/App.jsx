import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

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
import ApiDocs from "./pages/ApiDocs";

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      <Sidebar />

      <main className="flex-1 min-w-0 px-8 py-0 flex flex-col">
        <Header />

        <div className="flex-1 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/content" element={<ContentAnalytics />} />
            <Route path="/audience" element={<AudienceAnalytics />} />
            <Route path="/growth" element={<GrowthTrends />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/sponsorships" element={<Sponsorships />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
