import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Sidebar from './components/Sidebar'
import Header from './components/Header'

import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ContentAnalytics from './pages/ContentAnalytics'
import AudienceAnalytics from './pages/AudienceAnalytics'
import GrowthTrends from './pages/GrowthTrends'
import Revenue from './pages/Revenue'
import Sponsorships from './pages/Sponsorships'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import Profile from './pages/Profile'

function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/content" element={<ContentAnalytics />} />
            <Route path="/audience" element={<AudienceAnalytics />} />
            <Route path="/growth" element={<GrowthTrends />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/sponsorships" element={<Sponsorships />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App