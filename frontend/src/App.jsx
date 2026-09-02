import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Content from "./pages/Content";
import Audience from "./pages/Audience";
import Growth from "./pages/Growth";
import Revenue from "./pages/Revenue";
import Sponsorships from "./pages/Sponsorships";
import PlatformComparison from "./pages/PlatformComparison";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/content" element={<Content />} />
        <Route path="/audience" element={<Audience />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/sponsorships" element={<Sponsorships />} />
        <Route path="/platform-comparison" element={<PlatformComparison />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider><AppRoutes /></AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}