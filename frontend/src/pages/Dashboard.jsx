import Sidebar from '../components/Sidebar'
import YouTubeSyncCard from '../components/YouTubeSyncCard'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1>Welcome, {user?.name}</h1>
        <p className="text-muted">
          Sprint 1 foundation is live: auth, protected routing, and this
          dashboard shell. Content and engagement analytics land in Sprint 2.
        </p>

        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Role</span>
            <span className="kpi-value">{user?.role}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Email</span>
            <span className="kpi-value">{user?.email}</span>
          </div>
        </div>

        <YouTubeSyncCard />
      </main>
    </div>
  )
}
